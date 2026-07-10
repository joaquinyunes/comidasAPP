import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/pagos/mercadopago/preferencia — Crear preferencia de pago
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { pedidoId, monto, descripcion, emailComprador, backUrl, notificationUrl } = body;

    if (!pedidoId || !monto || !descripcion) {
      return NextResponse.json(
        { error: "pedidoId, monto y descripcion son requeridos" },
        { status: 400 }
      );
    }

    // Verificar pedido
    const pedido = await prisma.pedido.findFirst({
      where: { id: pedidoId, tenantId: context.tenantId },
      include: { cliente: true },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // En producción: llamar a API de MercadoPago
    // const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    // const preference = new Preference(mp);
    // const result = await preference.create({ ... });

    // Mock response para desarrollo
    const mockPreference = {
      id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      init_point: `${process.env.NEXT_PUBLIC_APP_URL}/pagos/mercadopago/checkout?pref_id=mock_${pedidoId}`,
      sandbox_init_point: `${process.env.NEXT_PUBLIC_APP_URL}/pagos/mercadopago/checkout?pref_id=mock_${pedidoId}&sandbox=true`,
    };

    // Guardar preferencia en BD
    await prisma.pago.create({
      data: {
        tenantId: context.tenantId,
        pedidoId,
        monto,
        metodoPago: "qr_mp",
        estado: "pendiente",
        comprobanteUrl: mockPreference.init_point,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR_PREFERENCIA",
        entidad: "PagoMercadoPago",
        entidadId: mockPreference.id,
        valorNuevo: { pedidoId, monto, descripcion, email: emailComprador || pedido.cliente?.email },
      },
    });

    return NextResponse.json({
      success: true,
      preferencia: mockPreference,
      mensaje: "Redirija al usuario a init_point para completar el pago",
    });
  } catch (error) {
    console.error("Error POST /api/pagos/mercadopago/preferencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}