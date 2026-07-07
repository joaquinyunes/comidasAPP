import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// POST /api/pagos — Crear pago
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pedidoId, monto, propina = 0, metodoPago, cajaId } = body;

    // Validación básica
    if (!pedidoId || !monto || !metodoPago) {
      return NextResponse.json(
        { error: "pedidoId, monto y metodoPago son requeridos" },
        { status: 400 }
      );
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const metodosValidos = ["efectivo", "tarjeta_credito", "tarjeta_debito", "qr_mp", "transferencia"];
    if (!metodosValidos.includes(metodoPago)) {
      return NextResponse.json(
        { error: `Método de pago inválido. Válidos: ${metodosValidos.join(", ")}` },
        { status: 400 }
      );
    }

    // Verificar que el pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Crear el pago
    const pago = await prisma.pago.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId,
        cajaId: cajaId || null,
        monto,
        propina,
        metodoPago,
        estado: "completado",
      },
    });

    // Actualizar estado del pedido
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado: "cerrado" },
    });

    // Registrar evento
    await prisma.pedidoEvento.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId,
        evento: "pago_completado",
        metadata: {
          pagoId: pago.id,
          monto,
          metodoPago,
        },
      },
    });

    return NextResponse.json({
      success: true,
      pago: {
        id: pago.id,
        monto: pago.monto,
        propina: pago.propina,
        metodoPago: pago.metodoPago,
        estado: pago.estado,
        createdAt: pago.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al crear pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/pagos — Listar pagos
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("pedidoId");
    const cajaId = searchParams.get("cajaId");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const where: Record<string, unknown> = {};

    if (pedidoId) where.pedidoId = pedidoId;
    if (cajaId) where.cajaId = cajaId;
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) (where.createdAt as Record<string, Date>).gte = new Date(desde);
      if (hasta) (where.createdAt as Record<string, Date>).lte = new Date(hasta);
    }

    const pagos = await prisma.pago.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ pagos });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
