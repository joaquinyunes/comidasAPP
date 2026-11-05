export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { mpDisponible, consultarPago } from "@/lib/pagos/mercadopago";
import { firmaMpValida } from "@/lib/pagos/firma-webhook";
import { registrarPagoPedido } from "@/lib/pedidos/registrar-pago";

// ============================================
// POST /api/pagos/mercadopago/webhook
// Notificación de MercadoPago. Confirma el pago y marca el pedido.
// - Si MERCADOPAGO_WEBHOOK_SECRET está seteado, exige `x-signature` válida.
// - Es idempotente (índice único pedido+referencia): MP puede reintentar o
//   mandar dos avisos a la vez sin duplicar el cobro.
// ============================================

export async function POST(req: NextRequest) {
  if (!mpDisponible()) return NextResponse.json({ ok: true });

  // MP manda el id como query (?type=payment&data.id=) o en el body.
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const tipo = url.searchParams.get("type") || (body as { type?: string }).type;
  const paymentId =
    url.searchParams.get("data.id") ||
    (body as { data?: { id?: string | number } }).data?.id ||
    url.searchParams.get("id");

  if (tipo !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true }); // ignoramos lo que no sea un pago
  }

  // El id va a una URL de la API de MP: solo dígitos.
  if (!/^\d{1,20}$/.test(String(paymentId))) {
    return NextResponse.json({ error: "id de pago inválido" }, { status: 400 });
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    const ok = firmaMpValida({
      secret,
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: url.searchParams.get("data.id") || String(paymentId),
    });
    if (!ok) return NextResponse.json({ error: "firma inválida" }, { status: 401 });
  } else {
    console.warn("[mp/webhook] MERCADOPAGO_WEBHOOK_SECRET sin configurar: firma sin verificar");
  }

  try {
    const pago = await consultarPago(String(paymentId));
    const refValida = !!pago.externalReference && /^[0-9a-f-]{36}$/i.test(pago.externalReference);
    if (pago.status === "approved" && !refValida) {
      console.error("[mp/webhook] pago aprobado sin referencia de pedido válida:", paymentId);
    }
    if (pago.status === "approved" && refValida && pago.externalReference) {
      const r = await registrarPagoPedido({
        pedidoId: pago.externalReference,
        monto: pago.amount,
        metodo: "qr",
        referencia: `mp:${paymentId}`,
      });
      if ("error" in r) console.error("[mp/webhook] registrarPago:", r.error); // pedido inexistente: 200, sin loop
    }
  } catch (e) {
    console.error("[mp/webhook]", e);
    // 500 para que MP reintente (falla transitoria de BD o de la API de MP):
    // es seguro porque registrarPagoPedido es idempotente.
    return NextResponse.json({ error: "reintentar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
