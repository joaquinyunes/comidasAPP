import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  pedido: null as null | { id: string; estado: string; total: number; mesa: { numero: number } | null; pagos: { monto: number; propina: number }[] },
  crearPreferencia: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => async () => null }));
vi.mock("@/lib/prisma", () => ({ prisma: { pedido: { findUnique: async () => m.pedido } } }));
vi.mock("@/lib/pagos/mercadopago", () => ({ mpDisponible: () => true, crearPreferencia: m.crearPreferencia }));

import { POST } from "@/app/api/cliente/pedido/[id]/pago/mercadopago/route";

const ID = "11111111-2222-4333-8444-555555555555";
const pedirLink = (body: object = {}) =>
  POST(new Request("http://x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never, { params: Promise.resolve({ id: ID }) });

beforeEach(() => {
  m.crearPreferencia.mockReset().mockResolvedValue({ initPoint: "https://mp/pagar", preferenceId: "pref" });
  m.pedido = { id: ID, estado: "entregado", total: 10000, mesa: { numero: 4 }, pagos: [] };
});

describe("POST /api/cliente/pedido/[id]/pago/mercadopago (M1, B8)", () => {
  it("cobra el total cuando no hay pagos previos", async () => {
    const res = await pedirLink();
    expect(res.status).toBe(200);
    expect(m.crearPreferencia.mock.calls[0][0].monto).toBe(10000);
  });

  it("cobra solo el SALDO pendiente (no el total) si ya hubo un pago parcial", async () => {
    m.pedido!.pagos = [{ monto: 4000, propina: 0 }];
    await pedirLink();
    expect(m.crearPreferencia.mock.calls[0][0].monto).toBe(6000);
  });

  it("la propina se calcula sobre el saldo", async () => {
    m.pedido!.pagos = [{ monto: 4000, propina: 0 }];
    await pedirLink({ porcentajePropina: 10 });
    expect(m.crearPreferencia.mock.calls[0][0].monto).toBe(6600);
  });

  it("sin saldo (ya cubierto con pagos parciales): 409 y no crea la preferencia", async () => {
    m.pedido!.pagos = [{ monto: 11000, propina: 1000 }];
    expect((await pedirLink()).status).toBe(409);
    expect(m.crearPreferencia).not.toHaveBeenCalled();
  });

  it("pedido cancelado: 409 y no crea la preferencia", async () => {
    m.pedido!.estado = "cancelado";
    expect((await pedirLink()).status).toBe(409);
    expect(m.crearPreferencia).not.toHaveBeenCalled();
  });

  it("pedido ya pagado: 409", async () => {
    m.pedido!.estado = "pagado";
    expect((await pedirLink()).status).toBe(409);
  });
});
