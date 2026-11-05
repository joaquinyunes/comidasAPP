import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const m = vi.hoisted(() => ({
  ctx: { tenantId: "11111111-1111-4111-8111-111111111111", usuarioId: "u1", roles: [], permisos: ["*"] } as unknown,
  pedidoFindFirst: vi.fn(),
  cajaFindFirst: vi.fn(),
  auditCreate: vi.fn(),
  pagoFindMany: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => m.ctx }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    pedido: { findFirst: m.pedidoFindFirst },
    caja: { findFirst: m.cajaFindFirst },
    auditLog: { create: m.auditCreate },
    pago: { findMany: m.pagoFindMany },
    producto: { findMany: async () => [], count: async () => 0 },
    $transaction: async () => ({ id: "p", monto: 1, propina: 0, metodoPago: "efectivo", estado: "completado", createdAt: new Date() }),
  },
}));

import { POST as pagar, GET as listarPagos } from "@/app/api/pagos/route";
import { POST as auditar } from "@/app/api/audit/route";
import { GET as productosV1 } from "@/app/api/v1/productos/route";

const PEDIDO = "22222222-2222-4222-8222-222222222222";
const req = (url: string, body?: unknown, headers: Record<string, string> = {}) =>
  new Request(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as never;

beforeEach(() => {
  m.ctx = { tenantId: "11111111-1111-4111-8111-111111111111", usuarioId: "u1", roles: [], permisos: ["*"] };
  m.pedidoFindFirst.mockReset().mockResolvedValue(null);
  m.cajaFindFirst.mockReset().mockResolvedValue(null);
  m.auditCreate.mockReset().mockResolvedValue({});
  m.pagoFindMany.mockReset().mockResolvedValue([]);
});
afterEach(() => {
  delete process.env.API_V1_KEYS;
  vi.restoreAllMocks();
});

describe("POST /api/pagos — aislamiento entre restaurantes y validación", () => {
  it("sin sesión: 401", async () => {
    m.ctx = null;
    const res = await pagar(req("http://x/api/pagos", { pedidoId: PEDIDO, monto: 100, metodoPago: "efectivo" }));
    expect(res.status).toBe(401);
  });

  it("busca el pedido SOLO dentro del restaurante de la sesión", async () => {
    const res = await pagar(req("http://x/api/pagos", { pedidoId: PEDIDO, monto: 100, metodoPago: "efectivo" }));
    expect(res.status).toBe(404); // el pedido de otro restaurante no aparece
    expect(m.pedidoFindFirst.mock.calls[0][0].where).toMatchObject({ id: PEDIDO, tenantId: "11111111-1111-4111-8111-111111111111" });
  });

  it.each([
    ["monto negativo", { pedidoId: PEDIDO, monto: -5, metodoPago: "efectivo" }],
    ["monto como texto", { pedidoId: PEDIDO, monto: "100", metodoPago: "efectivo" }],
    ["método inexistente", { pedidoId: PEDIDO, monto: 100, metodoPago: "bitcoin" }],
    ["pedido que no es uuid", { pedidoId: "abc", monto: 100, metodoPago: "efectivo" }],
    ["propina negativa", { pedidoId: PEDIDO, monto: 100, metodoPago: "efectivo", propina: -1 }],
  ])("rechaza %s con 400", async (_n, body) => {
    const res = await pagar(req("http://x/api/pagos", body));
    expect(res.status).toBe(400);
    expect(m.pedidoFindFirst).not.toHaveBeenCalled();
  });

  it("una caja de otro restaurante se rechaza", async () => {
    m.pedidoFindFirst.mockResolvedValue({ id: PEDIDO, tenantId: "11111111-1111-4111-8111-111111111111", mesaId: null, pagos: [] });
    const res = await pagar(
      req("http://x/api/pagos", { pedidoId: PEDIDO, monto: 100, metodoPago: "efectivo", cajaId: "33333333-3333-4333-8333-333333333333" })
    );
    expect(res.status).toBe(404);
  });

  it("GET lista solo los pagos del restaurante de la sesión", async () => {
    await listarPagos(req("http://x/api/pagos"));
    expect(m.pagoFindMany.mock.calls[0][0].where).toMatchObject({ tenantId: "11111111-1111-4111-8111-111111111111" });
  });
});

describe("POST /api/audit — no se puede falsificar el autor ni el restaurante", () => {
  it("ignora tenantId y usuarioId del body y usa los de la sesión", async () => {
    const res = await auditar(
      req("http://x/api/audit", {
        tenantId: "99999999-9999-4999-8999-999999999999",
        usuarioId: "otro",
        accion: "update",
        entidad: "Producto",
      })
    );
    expect(res.status).toBe(200);
    expect(m.auditCreate.mock.calls[0][0].data).toMatchObject({
      tenantId: "11111111-1111-4111-8111-111111111111",
      usuarioId: "u1",
    });
  });

  it("sin sesión: 401 y no escribe", async () => {
    m.ctx = null;
    const res = await auditar(req("http://x/api/audit", { accion: "update", entidad: "X" }));
    expect(res.status).toBe(401);
    expect(m.auditCreate).not.toHaveBeenCalled();
  });

  it("acción inventada: 400", async () => {
    const res = await auditar(req("http://x/api/audit", { accion: "borrar_todo", entidad: "X" }));
    expect(res.status).toBe(400);
  });
});

describe("API pública /api/v1 — claves", () => {
  const llamar = (clave?: string) =>
    productosV1(req("http://x/api/v1/productos", undefined, clave ? { "X-API-Key": clave } : {}));

  it("la clave de demo que estaba escrita en el código ya no sirve", async () => {
    expect((await llamar("demo-key-123")).status).toBe(401);
  });

  it("sin variable API_V1_KEYS no hay claves válidas", async () => {
    expect((await llamar("cualquier-clave-larga-de-24-caracteres")).status).toBe(401);
  });

  it("una clave de la variable de entorno autentica; por la URL no se acepta", async () => {
    const clave = "k".repeat(32);
    process.env.API_V1_KEYS = JSON.stringify({ [clave]: { tenantId: "11111111-1111-4111-8111-111111111111", scopes: ["productos:leer"] } });
    expect((await llamar(clave)).status).toBe(200);
    const porUrl = await productosV1(req(`http://x/api/v1/productos?api_key=${clave}`));
    expect(porUrl.status).toBe(401);
  });

  it("claves cortas o JSON inválido se ignoran", async () => {
    process.env.API_V1_KEYS = JSON.stringify({ corta: { tenantId: "11111111-1111-4111-8111-111111111111", scopes: ["productos:leer"] } });
    expect((await llamar("corta")).status).toBe(401);
    process.env.API_V1_KEYS = "{no es json";
    expect((await llamar("x".repeat(30))).status).toBe(401);
  });
});
