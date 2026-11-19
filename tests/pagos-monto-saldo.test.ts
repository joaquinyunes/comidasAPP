import { describe, it, expect, vi, beforeEach } from "vitest";

const T = "11111111-1111-4111-8111-111111111111";
const PEDIDO = "22222222-2222-4222-8222-222222222222";
const MESA = "44444444-4444-4444-8444-444444444444";

const m = vi.hoisted(() => ({
  pagosPrevios: [] as { id: string; monto: number; propina: number }[],
  total: 1000,
  estado: "entregado",
  pagoCreate: vi.fn(),
  pedidoUpdate: vi.fn(),
  mesaUpdate: vi.fn(),
  eventoCreate: vi.fn(),
  auditCreate: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => ({ tenantId: T, usuarioId: "u1", roles: [], permisos: ["*"] }) }));
vi.mock("@/lib/pedidos/mesa-sin-pendientes", () => ({ mesaSinPendientes: async () => true }));
vi.mock("@/lib/prisma", () => {
  const tx = {
    $queryRaw: async () => [],
    pedido: {
      findUniqueOrThrow: async () => ({ total: m.total, estado: m.estado }),
      update: m.pedidoUpdate,
    },
    pago: {
      findMany: async () => m.pagosPrevios,
      create: async (a: { data: Record<string, unknown> }) => {
        m.pagoCreate(a);
        return { id: "pago-nuevo", monto: a.data.monto, propina: a.data.propina, metodoPago: a.data.metodoPago, estado: "completado", createdAt: new Date() };
      },
    },
    mesa: { update: m.mesaUpdate },
    pedidoEvento: { create: m.eventoCreate },
    auditLog: { create: m.auditCreate },
  };
  return {
    prisma: {
      pedido: { findFirst: async () => ({ id: PEDIDO, tenantId: T, mesaId: MESA }) },
      caja: { findFirst: async () => null },
      $transaction: async (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});

import { POST } from "@/app/api/pagos/route";

const post = (body: unknown) =>
  POST(new Request("http://x/api/pagos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never);

beforeEach(() => {
  m.pagosPrevios = [];
  m.total = 1000;
  m.estado = "entregado";
  [m.pagoCreate, m.pedidoUpdate, m.mesaUpdate, m.eventoCreate, m.auditCreate].forEach((f) => f.mockReset());
});

describe("POST /api/pagos — el monto se valida contra el saldo", () => {
  it("cobro exacto: crea el pago, marca pagado y libera la mesa", async () => {
    const res = await post({ pedidoId: PEDIDO, monto: 1100, propina: 100, metodoPago: "efectivo" });
    expect(res.status).toBe(200);
    expect(m.pagoCreate).toHaveBeenCalledOnce();
    expect(m.pedidoUpdate).toHaveBeenCalledWith({ where: { id: PEDIDO }, data: { estado: "pagado" } });
    expect(m.mesaUpdate).toHaveBeenCalled();
  });

  it("cada cobro guarda QUIÉN lo hizo: en el pago, en el evento y en la auditoría (M2)", async () => {
    await post({ pedidoId: PEDIDO, monto: 1000, metodoPago: "efectivo" });
    expect(m.pagoCreate.mock.calls[0][0].data.usuarioId).toBe("u1");
    expect(m.eventoCreate.mock.calls[0][0].data.usuarioId).toBe("u1");
    expect(m.auditCreate.mock.calls[0][0].data).toMatchObject({ tenantId: T, usuarioId: "u1", accion: "create", entidad: "Pago", entidadId: "pago-nuevo" });
    expect(m.auditCreate.mock.calls[0][0].data.valorNuevo).toMatchObject({ pedidoId: PEDIDO, monto: 1000, metodoPago: "efectivo" });
  });

  it("un cobro parcial también queda auditado", async () => {
    await post({ pedidoId: PEDIDO, monto: 400, metodoPago: "efectivo", parcial: true, motivo: "divide la cuenta" });
    expect(m.auditCreate).toHaveBeenCalledOnce();
    expect(m.auditCreate.mock.calls[0][0].data.valorNuevo).toMatchObject({ parcial: true, motivo: "divide la cuenta" });
  });

  it("cobrar de más: 409 y no crea nada", async () => {
    const res = await post({ pedidoId: PEDIDO, monto: 5000, metodoPago: "efectivo" });
    expect(res.status).toBe(409);
    expect(m.pagoCreate).not.toHaveBeenCalled();
    expect(m.pedidoUpdate).not.toHaveBeenCalled();
  });

  it("cobrar de menos sin declarar parcial: 422 y no crea nada", async () => {
    const res = await post({ pedidoId: PEDIDO, monto: 10, metodoPago: "efectivo" });
    expect(res.status).toBe(422);
    expect(m.pagoCreate).not.toHaveBeenCalled();
    expect(m.pedidoUpdate).not.toHaveBeenCalled();
  });

  it("parcial con motivo: crea el pago, NO marca pagado ni libera la mesa, deja evento PAGO_PARCIAL", async () => {
    const res = await post({ pedidoId: PEDIDO, monto: 400, metodoPago: "efectivo", parcial: true, motivo: "divide la cuenta" });
    expect(res.status).toBe(200);
    expect(m.pagoCreate).toHaveBeenCalledOnce();
    expect(m.pedidoUpdate).not.toHaveBeenCalled();
    expect(m.mesaUpdate).not.toHaveBeenCalled();
    expect(m.eventoCreate.mock.calls[0][0].data).toMatchObject({ evento: "PAGO_PARCIAL" });
    expect(m.eventoCreate.mock.calls[0][0].data.metadata).toMatchObject({ motivo: "divide la cuenta" });
  });

  it("parcial sin motivo: 422", async () => {
    const res = await post({ pedidoId: PEDIDO, monto: 400, metodoPago: "efectivo", parcial: true });
    expect(res.status).toBe(422);
    expect(m.pagoCreate).not.toHaveBeenCalled();
  });

  it("segundo cobro que completa el saldo: marca pagado", async () => {
    m.pagosPrevios = [{ id: "p1", monto: 400, propina: 0 }];
    const res = await post({ pedidoId: PEDIDO, monto: 600, metodoPago: "tarjeta" });
    expect(res.status).toBe(200);
    expect(m.pedidoUpdate).toHaveBeenCalled();
  });

  it("pedido ya saldado: respuesta idempotente, no duplica el cobro", async () => {
    m.pagosPrevios = [{ id: "p1", monto: 1000, propina: 0 }];
    const res = await post({ pedidoId: PEDIDO, monto: 1000, metodoPago: "efectivo" });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.yaPagado).toBe(true);
    expect(m.pagoCreate).not.toHaveBeenCalled();
  });

  it("pedido cancelado: 409", async () => {
    m.estado = "cancelado";
    const res = await post({ pedidoId: PEDIDO, monto: 1000, metodoPago: "efectivo" });
    expect(res.status).toBe(409);
    expect(m.pagoCreate).not.toHaveBeenCalled();
  });
});
