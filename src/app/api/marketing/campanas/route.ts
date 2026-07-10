import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CampanaSchema, CuponSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/marketing/campanas — Listar campañas
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado") || undefined;
    const tipo = searchParams.get("tipo") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;

    const [campanas, total] = await Promise.all([
      prisma.campana.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campana.count({ where }),
    ]);

    return NextResponse.json({
      data: campanas,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/marketing/campanas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/marketing/campanas — Crear campaña
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(CampanaSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const campana = await prisma.campana.create({
      data: {
        tenantId: context.tenantId,
        ...validation.data,
        fechaInicio: new Date(validation.data.fechaInicio),
        fechaFin: validation.data.fechaFin ? new Date(validation.data.fechaFin) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Campana",
        entidadId: campana.id,
        valorNuevo: campana as any,
      },
    });

    return NextResponse.json({ success: true, campana }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/marketing/campanas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}