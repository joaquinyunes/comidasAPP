import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";

const mocks = vi.hoisted(() => ({
  consultarPago: vi.fn(),
  registrarPagoPedido: vi.fn(),
}));

vi.mock("@/lib/pagos/mercadopago", () => ({
  mpDisponible: () => !!process.env.MERCADOPAGO_ACCESS_TOKEN,
  consultarPago: mocks.consultarPago,
}));
vi.mock("@/lib/pedidos/registrar-pago", () => ({ registrarPagoPedido: mocks.registrarPagoPedido }));

import { POST } from "@/app/api/pagos/mercadopago/webhook/route";
import { firmaMpValida } from "@/lib/pagos/firma-webhook";

const PEDIDO = "11111111-2222-4333-8444-555555555555";
const SECRET = "secreto-de-prueba";

const post = (query: string, headers: Record<string, string> = {}, body: unknown = {}) =>
  POST(
    new Request(`http://localhost/api/pagos/mercadopago/webhook?${query}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }) as never
  );

function firmar(dataId: string, requestId = "req-1", ts = "1730000000", secret = SECRET) {
  const v1 = createHmac("sha256", secret).update(`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`).digest("hex");
  return { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId };
}

beforeEach(() => {
  mocks.consultarPago.mockReset();
  mocks.registrarPagoPedido.mockReset();
  mocks.registrarPagoPedido.mockResolvedValue({ pagoId: "pg-1", yaPagado: false });
  process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  delete process.env.MERCADOPAGO_ACCESS_TOKEN;
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  vi.restoreAllMocks();
});

describe("webhook de MercadoPago", () => {
  it("pago aprobado: registra el cobro con la referencia mp:<id>", async () => {
    mocks.consultarPago.mockResolvedValue({ status: "approved", externalReference: PEDIDO, amount: 5000 });
    const res = await post("type=payment&data.id=123");
    expect(res.status).toBe(200);
    expect(mocks.registrarPagoPedido).toHaveBeenCalledWith({
      pedidoId: PEDIDO,
      monto: 5000,
      metodo: "qr",
      referencia: "mp:123",
    });
  });

  it("pago pendiente: responde 200 y no registra nada", async () => {
    mocks.consultarPago.mockResolvedValue({ status: "pending", externalReference: PEDIDO, amount: 5000 });
    const res = await post("type=payment&data.id=123");
    expect(res.status).toBe(200);
    expect(mocks.registrarPagoPedido).not.toHaveBeenCalled();
  });

  it("id inválido (no numérico): 400 y no consulta a MercadoPago", async () => {
    const res = await post("type=payment&data.id=../../x");
    expect(res.status).toBe(400);
    expect(mocks.consultarPago).not.toHaveBeenCalled();
  });

  it("evento que no es de pago: se ignora con 200", async () => {
    const res = await post("type=merchant_order&data.id=123");
    expect(res.status).toBe(200);
    expect(mocks.consultarPago).not.toHaveBeenCalled();
  });

  it("referencia que no es un id de pedido: no registra", async () => {
    mocks.consultarPago.mockResolvedValue({ status: "approved", externalReference: "cualquier-cosa", amount: 10 });
    const res = await post("type=payment&data.id=123");
    expect(res.status).toBe(200);
    expect(mocks.registrarPagoPedido).not.toHaveBeenCalled();
  });

  it("reintento del mismo aviso: registra dos veces la misma referencia (la BD lo vuelve idempotente) y responde 200", async () => {
    mocks.consultarPago.mockResolvedValue({ status: "approved", externalReference: PEDIDO, amount: 5000 });
    mocks.registrarPagoPedido
      .mockResolvedValueOnce({ pagoId: "pg-1", yaPagado: false })
      .mockResolvedValueOnce({ pagoId: "pg-1", yaPagado: true });
    const a = await post("type=payment&data.id=123");
    const b = await post("type=payment&data.id=123");
    expect([a.status, b.status]).toEqual([200, 200]);
    const refs = mocks.registrarPagoPedido.mock.calls.map((c) => c[0].referencia);
    expect(refs).toEqual(["mp:123", "mp:123"]);
  });

  it("falla transitoria al consultar o guardar: 500 para que MP reintente", async () => {
    mocks.consultarPago.mockRejectedValue(new Error("MP caído"));
    const res = await post("type=payment&data.id=123");
    expect(res.status).toBe(500);
  });

  it("sin MERCADOPAGO_ACCESS_TOKEN: no hace nada", async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    const res = await post("type=payment&data.id=123");
    expect(res.status).toBe(200);
    expect(mocks.consultarPago).not.toHaveBeenCalled();
  });
});

describe("webhook de MercadoPago — firma x-signature (S6)", () => {
  beforeEach(() => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
    mocks.consultarPago.mockResolvedValue({ status: "approved", externalReference: PEDIDO, amount: 5000 });
  });

  it("firma válida: procesa el pago", async () => {
    const res = await post("type=payment&data.id=123", firmar("123"));
    expect(res.status).toBe(200);
    expect(mocks.registrarPagoPedido).toHaveBeenCalledTimes(1);
  });

  it("firma inválida (otro secreto): 401 y no registra", async () => {
    const res = await post("type=payment&data.id=123", firmar("123", "req-1", "1730000000", "otro-secreto"));
    expect(res.status).toBe(401);
    expect(mocks.consultarPago).not.toHaveBeenCalled();
    expect(mocks.registrarPagoPedido).not.toHaveBeenCalled();
  });

  it("sin cabecera de firma: 401", async () => {
    const res = await post("type=payment&data.id=123");
    expect(res.status).toBe(401);
  });

  it("firma de otro pago (data.id distinto): 401", async () => {
    const res = await post("type=payment&data.id=999", firmar("123"));
    expect(res.status).toBe(401);
  });

  it("firmaMpValida rechaza v1 mal formado sin lanzar", () => {
    expect(firmaMpValida({ secret: SECRET, xSignature: "ts=1,v1=zz", xRequestId: "r", dataId: "1" })).toBe(false);
    expect(firmaMpValida({ secret: SECRET, xSignature: "basura", xRequestId: "r", dataId: "1" })).toBe(false);
  });
});
