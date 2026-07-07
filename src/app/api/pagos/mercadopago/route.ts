import { NextRequest, NextResponse } from "next/server";

// ============================================
// POST /api/pagos/mercadopago/preferencia
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pedidoId, monto, descripcion, emailComprador } = body;

    // Validación
    if (!pedidoId || !monto) {
      return NextResponse.json(
        { error: "pedidoId y monto son requeridos" },
        { status: 400 }
      );
    }

    // En producción: usar SDK de MercadoPago
    // const mercadopago = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN });
    // const preference = await mercadopago.preferences.create({...});

    // Mock response para desarrollo
    const preferenceId = `MP-${Date.now()}`;
    const initPoint = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;

    // Simular delay de API externa
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      id: preferenceId,
      init_point: initPoint,
      status: "created",
    });
  } catch (error) {
    console.error("Error al crear preferencia MP:", error);
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/pagos/mercadopago/webhook
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // En producción: verificar firma del webhook
    // const signature = request.headers.get("x-signature");

    const { type, data } = body;

    if (type === "payment") {
      const paymentId = data.id;

      // En producción: consultar estado del pago
      // const payment = await mercadopago.payment.get(paymentId);

      console.log(`📊 Webhook MP: Pago ${paymentId} actualizado`);

      // Actualizar pago en DB
      // await prisma.pago.updateMany({
      //   where: { mpPaymentId: String(paymentId) },
      //   data: { estado: payment.status === "approved" ? "completado" : "fallido" },
      // });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error en webhook MP:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
