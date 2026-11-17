import { describe, it, expect, vi, beforeEach } from "vitest";

// CRÍTICA (revisión independiente): la ruta PÚBLICA de pago no puede marcar un pedido como
// pagado: cualquiera que conozca el id podía mandar {"metodo":"qr"} y cerrar la mesa sin pagar.
const PEDIDO = "22222222-2222-4222-8222-222222222222";
const m = vi.hoisted(() => ({
  pedido: null as unknown,
  pagoCreate: vi.fn(),
  pedidoUpdate: vi.fn(),
  mesaUpdate: vi.fn(),
  eventoCreate: vi.fn(),
  notifCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pedido: { findUnique: async () => m.pedido, update: m.pedidoUpdate },
    pago: { create: m.pagoCreate },
    mesa: { update: m.mesaUpdate },
    pedidoEvento: { create: m.eventoCreate },
    notificacion: { create: m.notifCreate },
    $transaction: m.transaction,
  },
}));

import { POST } from "@/app/api/cliente/pedido/[id]/pago/route";

const llamar = (body: unknown, ip = "9.9.9.9") =>
  POST(
    new Request("http://x/api/cliente/pedido/" + PEDIDO + "/pago", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }) as never,
    { params: Promise.resolve({ id: PEDIDO }) }
  );

beforeEach(() => {
  vi.restoreAllMocks();
  Object.values(m).forEach((v) => typeof v === "function" && "mockReset" in v && (v as ReturnType<typeof vi.fn>).mockReset());
  m.pedido = { id: PEDIDO, tenantId: "t1", mesaId: "mesa1", estado: "en_preparacion", total: 5000, pagos: [], mesa: { numero: "7" } };
  m.eventoCreate.mockResolvedValue({});
  m.notifCreate.mockResolvedValue({});
});

describe("POST /api/cliente/pedido/[id]/pago (público)", () => {
  it.each(["efectivo", "tarjeta", "qr", "transferencia"])("método %s: NO crea pago, NO marca pagado y NO libera la mesa", async (metodo) => {
    const res = await llamar({ metodo, montoEfectivo: 999999, porcentajePropina: 10 }, "1.1.1." + metodo.length);
    expect(res.status).toBe(200);
    expect(m.pagoCreate).not.toHaveBeenCalled();
    expect(m.pedidoUpdate).not.toHaveBeenCalled();
    expect(m.mesaUpdate).not.toHaveBeenCalled();
    expect(m.transaction).not.toHaveBeenCalled();
    const json = await res.json();
    expect(json.data.pedidoSaldado).toBe(false);
    expect(json.data.cuentaSolicitada).toBe(true);
    expect(json.data.pagoId).toBe("");
  });

  it("deja registrado que pidió la cuenta (evento) y avisa al personal, con el método elegido", async () => {
    await llamar({ metodo: "tarjeta", porcentajePropina: 10 }, "2.2.2.2");
    expect(m.eventoCreate).toHaveBeenCalledOnce();
    const ev = m.eventoCreate.mock.calls[0][0].data;
    expect(ev).toMatchObject({ tenantId: "t1", pedidoId: PEDIDO, evento: "CUENTA_SOLICITADA" });
    expect(ev.metadata).toMatchObject({ metodo: "tarjeta" });
    expect(m.notifCreate).toHaveBeenCalledOnce();
  });

  it("un pedido cancelado devuelve 409 y no escribe nada", async () => {
    m.pedido = { ...(m.pedido as object), estado: "cancelado" };
    const res = await llamar({ metodo: "qr" }, "3.3.3.3");
    expect(res.status).toBe(409);
    expect(m.eventoCreate).not.toHaveBeenCalled();
  });

  it("un pedido que ya está saldado responde 'ya pagado' sin escribir", async () => {
    m.pedido = { ...(m.pedido as object), pagos: [{ monto: 5000, propina: 0 }] };
    const res = await llamar({ metodo: "qr" }, "4.4.4.4");
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.yaPagado).toBe(true);
    expect(m.eventoCreate).not.toHaveBeenCalled();
  });

  it("pedido inexistente: 404", async () => {
    m.pedido = null;
    expect((await llamar({ metodo: "qr" }, "5.5.5.5")).status).toBe(404);
  });

  it("método inventado: 422", async () => {
    expect((await llamar({ metodo: "bitcoin" }, "6.6.6.6")).status).toBe(422);
  });
});
