import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SectorSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/sectores — Listar sectores
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (context.sucursalId) where.sucursalId = context.sucursalId;

    const sectores = await prisma.sector.findMany({
      where,
      include: {
        mesas: {
          where: { activa: true },
          orderBy: { numero: "asc" },
        },
        sucursal: true,
      },
      orderBy: { orden: "asc" },
    });

    return NextResponse.json({ data: sectores });
  } catch (error) {
    console.error("Error GET /api/sectores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/sectores — Crear sector
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(SectorSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const { nombre, tipo, orden } = validation.data;

    // Verificar sucursal
    const sucursalId = context.sucursalId || body.sucursalId;
    if (!sucursalId) {
      return NextResponse.json({ error: "Se requiere sucursalId" }, { status: 400 });
    }

    const sucursal = await prisma.sucursal.findFirst({
      where: { id: sucursalId, tenantId: context.tenantId },
    });

    if (!sucursal) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }

    const sector = await prisma.sector.create({
      data: {
        tenantId: context.tenantId,
        sucursalId,
        nombre,
        tipo,
        orden,
      },
      include: { sucursal: true, mesas: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Sector",
        entidadId: sector.id,
        valorNuevo: sector as any,
      },
    });

    return NextResponse.json({ success: true, sector }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/sectores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}