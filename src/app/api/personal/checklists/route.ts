import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChecklistPlantillaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/personal/checklists — Listar plantillas
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || undefined;
    const sucursalId = searchParams.get("sucursalId") || undefined;

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (tipo) where.tipo = tipo;
    if (sucursalId) where.sucursalId = sucursalId;

    const plantillas = await prisma.checklistPlantilla.findMany({
      where,
      include: {
        _count: { select: { items: true, ejecuciones: true } },
        sucursal: { select: { id: true, nombre: true } },
      },
      orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
    });

    return NextResponse.json({ data: plantillas });
  } catch (error) {
    console.error("Error GET /api/personal/checklists:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/personal/checklists — Crear plantilla con ítems
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(ChecklistPlantillaSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    if (validation.data.sucursalId) {
      const sucursal = await prisma.sucursal.findFirst({
        where: { id: validation.data.sucursalId, tenantId: context.tenantId },
      });
      if (!sucursal) {
        return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
      }
    }

    const plantilla = await prisma.checklistPlantilla.create({
      data: {
        tenantId: context.tenantId,
        tipo: validation.data.tipo,
        nombre: validation.data.nombre,
        sucursalId: validation.data.sucursalId,
        items: {
          create: validation.data.items.map((it) => ({
            tenantId: context.tenantId,
            descripcion: it.descripcion,
            obligatorio: it.obligatorio,
            orden: it.orden,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "ChecklistPlantilla",
        entidadId: plantilla.id,
        valorNuevo: plantilla as any,
      },
    });

    return NextResponse.json({ success: true, plantilla }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/personal/checklists:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
