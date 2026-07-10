import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/pagos/stripe/charge — Crear cobro con Stripe
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { pedidoId, monto, currency = "ARS", paymentMethodId } = body;

    if (!pedidoId || !monto || !paymentMethodId) {
      return NextResponse.json(
        { error: "pedidoId, monto y paymentMethodId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar pedido
    const pedido = await prisma.pedido.findFirst({
      where: { id: pedidoId, tenantId: context.tenantId },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // En producción: usar Stripe SDK
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(monto * 100), // Stripe usa centavos
    //   currency: currency.toLowerCase(),
    //   payment_method: paymentMethodId,
    //   confirm: true,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pedidos/${pedidoId}`,
    // });

    // Mock response
    const mockPayment = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "succeeded",
      amount: Math.round(monto * 100),
      currency,
      payment_method: paymentMethodId,
      created: Math.floor(Date.now() / 1000),
    };

    if (mockPayment.status === "succeeded") {
      await prisma.$transaction([
        prisma.pago.create({
          data: {
            tenantId: context.tenantId,
            pedidoId,
            monto,
            metodoPago: "tarjeta_credito",
            estado: "completado",
            comprobanteUrl: `https://dashboard.stripe.com/payments/${mockPayment.id}`,
          },
        }),
        prisma.pedido.update({
          where: { id: pedidoId },
          data: { estado: "cerrado" },
        }),
        prisma.pedidoEvento.create({
          data: {
            tenantId: context.tenantId,
            pedidoId,
            evento: "pago_completado_stripe",
            metadata: { paymentId: mockPayment.id, monto, currency },
          },
        }),
      ]);
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR_COBRO",
        entidad: "PagoStripe",
        entidadId: mockPayment.id,
        valorNuevo: { pedidoId, monto, currency, paymentMethodId },
      },
    });

    return NextResponse.json({ success: true, payment: mockPayment });
  } catch (error) {
    console.error("Error POST /api/pagos/stripe/charge:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}