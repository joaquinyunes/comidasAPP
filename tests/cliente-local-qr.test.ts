import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const m = vi.hoisted(() => ({ crear: vi.fn() }));
vi.mock("@/lib/pedidos/crear-local", () => ({ crearPedidoLocal: m.crear }));
vi.mock("@/lib/limite-intentos", async () => (await import("./ayudas/falso-limite-intentos")).falso);

import { POST } from "@/app/api/cliente/local/route";
import { falso } from "./ayudas/falso-limite-intentos";

const ITEM = { productoId: "11111111-1111-4111-8111-111111111111", cantidad: 1 };
const pedir = (codigo: string | null, referencia = "mesa-uno", ip = "7.7.7.7") =>
  POST(
    new Request("http://x/api/cliente/local", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip, ...(codigo ? { "x-qr-local-codigo": codigo } : {}) },
      body: JSON.stringify({ referencia, items: [ITEM] }),
    }) as never
  );

beforeEach(() => {
  falso.vaciar();
  m.crear.mockReset().mockResolvedValue({ ok: true, pedidoId: "p", subtotal: 1, descuento: 0, total: 1, duplicado: false });
  vi.stubEnv("QR_LOCAL_CODIGO", "codigo-secreto-del-local");
  vi.stubEnv("NEXT_PUBLIC_QR_LOCAL_CODIGO", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/cliente/local (pedido en mesa)", () => {
  it("sin código o con código incorrecto: 403 y no se crea nada", async () => {
    expect((await pedir(null, "a", "1.0.0.1")).status).toBe(403);
    expect((await pedir("incorrecto", "a", "1.0.0.2")).status).toBe(403);
    expect(m.crear).not.toHaveBeenCalled();
  });
  it("con el código del servidor: crea el pedido", async () => {
    expect((await pedir("codigo-secreto-del-local", "mesa-ok", "1.0.0.3")).status).toBe(201);
    expect(m.crear).toHaveBeenCalledOnce();
  });
  it("10 códigos incorrectos desde una IP la bloquean (429), incluso con el código correcto; otra IP sigue sirviendo", async () => {
    for (let i = 0; i < 10; i++) expect((await pedir("mal", `m${i}`, "5.5.5.5")).status).toBe(403);
    const bloqueada = await pedir("codigo-secreto-del-local", "mesa-x", "5.5.5.5");
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.headers.get("retry-after")).toBeTruthy();
    expect(m.crear).not.toHaveBeenCalled();
    expect((await pedir("codigo-secreto-del-local", "mesa-x", "5.5.5.6")).status).toBe(201);
  });
  it("tope por mesa: pasadas 30 solicitudes en 10 minutos a la misma mesa, 429 (aunque cambie la IP)", async () => {
    let ultimo = 0;
    for (let i = 0; i < 32; i++) ultimo = (await pedir("codigo-secreto-del-local", "Mesa-Tope", `2.0.${i}.1`)).status;
    expect(ultimo).toBe(429);
    expect(m.crear.mock.calls.length).toBe(30);
    expect((await pedir("codigo-secreto-del-local", "otra-mesa", "2.9.9.9")).status).toBe(201);
  });
});
