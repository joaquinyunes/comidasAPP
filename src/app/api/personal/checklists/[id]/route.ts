import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/personal/checklists/[id] — Obtener plantilla
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    const plantilla = await prisma.checklistPlantilla.findFirst({
      where: { id, tenantId: context.tenantId },
      include: { items: { orderBy: { orden: "asc" } } },
    });

    if (!plantilla) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: plantilla });
  } catch (error) {
    console.error("Error GET /api/personal/checklists/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// PUT /api/personal/checklists/[id] — Actualizar plantilla
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    const plantilla = await prisma.checklistPlantilla.findFirst({
      where: { id, tenantId: context.tenantId },
    });
    if (!plantilla) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    const actualizada = await prisma.checklistPlantilla.update({
      where: { id },
      data: {
        nombre: body.nombre ?? plantilla.nombre,
        tipo: body.tipo ?? plantilla.tipo,
        activo: body.activo ?? plantilla.activo,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "ACTUALIZAR",
        entidad: "ChecklistPlantilla",
        entidadId: id,
        valorNuevo: body,
      },
    });

    return NextResponse.json({ success: true, plantilla: actualizada });
  } catch (error) {
    console.error("Error PUT /api/personal/checklists/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// DELETE /api/personal/checklists/[id] — Eliminar plantilla
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    const plantilla = await prisma.checklistPlantilla.findFirst({
      where: { id, tenantId: context.tenantId },
    });
    if (!plantilla) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    await prisma.checklistItem.deleteMany({ where: { plantillaId: id } });
    await prisma.checklistPlantilla.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Plantilla eliminada" });
  } catch (error) {
    console.error("Error DELETE /api/personal/checklists/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
