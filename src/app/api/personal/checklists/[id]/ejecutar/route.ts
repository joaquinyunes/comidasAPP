import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChecklistEjecucionSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/personal/checklists/[id]/ejecutar — Ejecutar plantilla
// ============================================
export async function POST(
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
    const validation = validateInput(ChecklistEjecucionSchema, { ...body, plantillaId: id });
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const plantilla = await prisma.checklistPlantilla.findFirst({
      where: { id, tenantId: context.tenantId },
      include: { items: true },
    });
    if (!plantilla) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    const itemIds = new Set(plantilla.items.map((i) => i.id));
    const enviados = validation.data.items;
    const faltan = enviados.filter((i) => !itemIds.has(i.itemId));
    if (faltan.length > 0) {
      return NextResponse.json({ error: "Hay ítems que no pertenecen a la plantilla" }, { status: 400 });
    }

    const obligatorios = plantilla.items.filter((i) => i.obligatorio);
    const completo = obligatorios.every(
      (oi) => enviados.find((e) => e.itemId === oi.id)?.marcado
    );

    const ejecucion = await prisma.checklistEjecucion.create({
      data: {
        tenantId: context.tenantId,
        plantillaId: id,
        sucursalId: validation.data.sucursalId,
        turnoId: validation.data.turnoId,
        usuarioId: context.usuarioId,
        completo,
        items: {
          create: enviados.map((it) => ({
            tenantId: context.tenantId,
            itemId: it.itemId,
            marcado: it.marcado,
            valor: it.valor,
          })),
        },
      },
      include: { items: { include: { item: true } } },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "EJECUTAR",
        entidad: "ChecklistEjecucion",
        entidadId: ejecucion.id,
        valorNuevo: { plantillaId: id, completo } as any,
      },
    });

    return NextResponse.json({ success: true, ejecucion, completo }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/personal/checklists/[id]/ejecutar:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
