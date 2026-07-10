import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// GET /api/pagos/mercadopago/[paymentId] — Verificar estado de pago
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    // En producción: consultar API de MercadoPago
    // const payment = await mp.payment.get(paymentId);

    // Mock para desarrollo
    const mockPayment = {
      id: paymentId,
      status: "approved",
      status_detail: "accredited",
      transaction_amount: 1000,
      external_reference: "pedido_123",
      payment_method_id: "master",
      payment_type_id: "credit_card",
      date_approved: new Date().toISOString(),
    };

    // Si el pago está aprobado, actualizar en BD
    if (mockPayment.status === "approved" && mockPayment.external_reference) {
      const pedidoId = mockPayment.external_reference.replace("pedido_", "");

      await prisma.$transaction([
        prisma.pago.updateMany({
          where: { pedidoId, metodoPago: "qr_mp", estado: "pendiente" },
          data: { estado: "completado", comprobanteUrl: `https://mercadopago.com/payments/${paymentId}` },
        }),
        prisma.pedido.update({
          where: { id: pedidoId },
          data: { estado: "cerrado" },
        }),
        prisma.pedidoEvento.create({
          data: {
            tenantId: "tenant-demo-001", // Se obtendría del pedido
            pedidoId,
            evento: "pago_completado_mp",
            metadata: { paymentId, monto: mockPayment.transaction_amount },
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, payment: mockPayment });
  } catch (error) {
    console.error("Error GET /api/pagos/mercadopago/[paymentId]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/pagos/mercadopago/webhook — Webhook de MercadoPago
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "payment") {
      const paymentId = data.id;

      // En producción: verificar firma del webhook
      // const payment = await mp.payment.get(paymentId);

      // Procesar pago
      console.log("Webhook MercadoPago recibido:", paymentId);

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error POST /api/pagos/mercadopago/webhook:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}