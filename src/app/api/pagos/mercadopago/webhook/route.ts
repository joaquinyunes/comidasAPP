export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { mpDisponible, consultarPago } from "@/lib/pagos/mercadopago";
import { registrarPagoPedido } from "@/lib/pedidos/registrar-pago";

// ============================================
// POST /api/pagos/mercadopago/webhook
// Notificación de MercadoPago. Confirma el pago y marca el pedido.
// ============================================

export async function POST(req: NextRequest) {
  if (!mpDisponible()) return NextResponse.json({ ok: true });

  // MP manda el id como query (?type=payment&data.id=) o en el body.
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const tipo = url.searchParams.get("type") || (body as { type?: string }).type;
  const paymentId =
    url.searchParams.get("data.id") ||
    (body as { data?: { id?: string } }).data?.id ||
    url.searchParams.get("id");

  if (tipo !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true }); // ignoramos lo que no sea un pago
  }

  try {
    const pago = await consultarPago(String(paymentId));
    if (pago.status === "approved" && pago.externalReference) {
      const r = await registrarPagoPedido({
        pedidoId: pago.externalReference,
        monto: pago.amount,
        metodo: "qr",
        referencia: `mp:${paymentId}`,
      });
      if ("error" in r) console.error("[mp/webhook] registrarPago:", r.error);
    }
  } catch (e) {
    console.error("[mp/webhook]", e);
    // Devolvemos 200 igual: MP reintenta si respondemos error, y no
    // queremos loops si el pedido ya no existe.
  }

  return NextResponse.json({ ok: true });
}
