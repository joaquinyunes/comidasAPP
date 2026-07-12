import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/operativo/pase — Mozo confirma el pase (entrega de ítem)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { pedidoId, itemId } = body;
    if (!pedidoId || !itemId) {
      return NextResponse.json({ error: "pedidoId e itemId son requeridos" }, { status: 400 });
    }

    const item = await prisma.pedidoItem.findFirst({
      where: { id: itemId, pedidoId, tenantId: context.tenantId },
    });
    if (!item) {
      return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
    }

    const actualizado = await prisma.pedidoItem.update({
      where: { id: itemId },
      data: { horaEntregado: new Date(), estado: "entregado" },
    });

    await prisma.pedidoEvento.create({
      data: {
        tenantId: context.tenantId,
        pedidoId,
        pedidoItemId: itemId,
        evento: "PASE_MOZO",
        usuarioId: context.usuarioId,
      },
    });

    // Si todos los ítems fueron entregados, cerrar el pedido
    const restantes = await prisma.pedidoItem.count({
      where: { pedidoId, anulado: false, horaEntregado: null },
    });
    if (restantes === 0) {
      await prisma.pedido.update({ where: { id: pedidoId }, data: { estado: "entregado" } });
    }

    return NextResponse.json({ success: true, item: actualizado, pedidoCerrado: restantes === 0 });
  } catch (error) {
    console.error("Error POST /api/operativo/pase:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
