import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AnulacionSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/pedidos/[id]/items/[itemId]/anular — Anulación trazable
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id, itemId } = await params;

    const body = await request.json();
    const validation = validateInput(AnulacionSchema, { ...body, pedidoItemId: itemId });
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const item = await prisma.pedidoItem.findFirst({
      where: { id: itemId, pedidoId: id, tenantId: context.tenantId },
      include: { pedido: { select: { id: true, sucursalId: true } } },
    });
    if (!item) {
      return NextResponse.json({ error: "Ítem de pedido no encontrado" }, { status: 404 });
    }
    if (item.anulado) {
      return NextResponse.json({ error: "El ítem ya fue anulado" }, { status: 409 });
    }

    const anulacion = await prisma.anulacion.create({
      data: {
        tenantId: context.tenantId,
        pedidoItemId: itemId,
        usuarioId: context.usuarioId,
        motivo: validation.data.motivo,
        motivoLibre: validation.data.motivoLibre,
      },
    });

    const actualizado = await prisma.pedidoItem.update({
      where: { id: itemId },
      data: { anulado: true, motivoAnulacion: validation.data.motivo },
    });

    await prisma.pedidoEvento.create({
      data: {
        tenantId: context.tenantId,
        pedidoId: id,
        pedidoItemId: itemId,
        evento: "ANULACION",
        usuarioId: context.usuarioId,
        metadata: { motivo: validation.data.motivo } as any,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "ANULAR",
        entidad: "PedidoItem",
        entidadId: itemId,
        valorAnterior: { anulado: false } as any,
        valorNuevo: { anulado: true, motivo: validation.data.motivo } as any,
      },
    });

    return NextResponse.json({ success: true, anulacion, item: actualizado }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/pedidos/[id]/items/[itemId]/anular:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
