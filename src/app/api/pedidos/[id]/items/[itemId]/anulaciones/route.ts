import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/pedidos/[id]/items/[itemId]/anulaciones — Historial
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id, itemId } = await params;

    const item = await prisma.pedidoItem.findFirst({
      where: { id: itemId, pedidoId: id, tenantId: context.tenantId },
    });
    if (!item) {
      return NextResponse.json({ error: "Ítem de pedido no encontrado" }, { status: 404 });
    }

    const anulaciones = await prisma.anulacion.findMany({
      where: { pedidoItemId: itemId, tenantId: context.tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: anulaciones, anulado: item.anulado });
  } catch (error) {
    console.error("Error GET /api/pedidos/[id]/items/[itemId]/anulaciones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
