export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { mpDisponible, consultarPago } from "@/lib/pagos/mercadopago";
import { firmaMpValida } from "@/lib/pagos/firma-webhook";
import { z } from "zod";
import { registrarPagoPedido } from "@/lib/pedidos/registrar-pago";
import { revertirPagoPedido } from "@/lib/pedidos/revertir-pago";
import { rateLimit } from "@/lib/rate-limit";

// Tope por IP: MP reintenta, pero nunca cientos de veces por minuto.
const limiteWebhook = rateLimit({ maxRequests: 120, windowMs: 60_000, keyGenerator: (r) => "mp-webhook:" + (r.headers.get("x-forwarded-for") ?? "?").split(",")[0].trim() });

// ============================================
// POST /api/pagos/mercadopago/webhook
// Notificación de MercadoPago. Confirma el pago y marca el pedido.
// - Si MERCADOPAGO_WEBHOOK_SECRET está seteado, exige `x-signature` válida.
// - Es idempotente (índice único pedido+referencia): MP puede reintentar o
//   mandar dos avisos a la vez sin duplicar el cobro.
// ============================================

export async function POST(req: NextRequest) {
  if (!mpDisponible()) return NextResponse.json({ ok: true });
  const limitada = await limiteWebhook(req);
  if (limitada) return limitada;

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
  } else if (process.env.NODE_ENV === "production") {
    // Falla cerrado: sin secreto no hay forma de saber quién llama. MP reintenta, así que no se
    // pierde el aviso: se normaliza apenas se cargue MERCADOPAGO_WEBHOOK_SECRET en el servidor.
    console.error("[mp/webhook] MERCADOPAGO_WEBHOOK_SECRET sin configurar en producción: se rechaza el aviso");
    return NextResponse.json({ error: "webhook sin configurar" }, { status: 500 });
  } else {
    console.warn("[mp/webhook] MERCADOPAGO_WEBHOOK_SECRET sin configurar (solo desarrollo): firma sin verificar");
  }

  try {
    const pago = await consultarPago(String(paymentId));
    const refValida = !!pago.externalReference && z.uuid().safeParse(pago.externalReference).success;
    const pedidoId = refValida ? pago.externalReference! : null;
    if (!pedidoId) {
      console.error("[mp/webhook] aviso sin referencia de pedido válida (uuid):", paymentId, pago.status);
    } else if (pago.status === "approved") {
      if (pago.currency !== "ARS") {
        // Un cobro en otra moneda no se puede tomar como pesos: se deja el aviso y se revisa a mano.
        console.error("[mp/webhook] pago aprobado en moneda distinta de ARS (", pago.currency, "):", paymentId);
      } else {
        const r = await registrarPagoPedido({ pedidoId, monto: pago.amount, metodo: "qr", referencia: `mp:${paymentId}` });
        if ("error" in r) console.error("[mp/webhook] registrarPago:", r.error); // pedido inexistente: 200, sin loop
      }
    } else if (pago.status === "refunded" || pago.status === "charged_back") {
      const r = await revertirPagoPedido({ pedidoId, referencia: `mp:${paymentId}`, motivo: pago.status });
      if ("error" in r) console.error("[mp/webhook] revertirPago:", r.error);
    }
  } catch (e) {
    console.error("[mp/webhook]", e);
    // 500 para que MP reintente (falla transitoria de BD o de la API de MP):
    // es seguro porque registrarPagoPedido es idempotente.
    return NextResponse.json({ error: "reintentar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
