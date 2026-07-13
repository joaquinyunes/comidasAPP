import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CuponSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/marketing/cupones — Listar cupones
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activo = searchParams.get("activo") !== "false";
    const busqueda = searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId, activo };
    if (busqueda) {
      where.OR = [
        { codigo: { contains: busqueda, mode: "insensitive" } },
        { descripcion: { contains: busqueda, mode: "insensitive" } },
      ];
    }

    const [cupones, total] = await Promise.all([
      prisma.cupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cupon.count({ where }),
    ]);

    return NextResponse.json({
      data: cupones,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/marketing/cupones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/marketing/cupones — Crear cupón
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(CuponSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    // Verificar código único
    const existing = await prisma.cupon.findFirst({
      where: { tenantId: context.tenantId, codigo: validation.data.codigo },
    });
    if (existing) {
      return NextResponse.json({ error: "El código de cupón ya existe" }, { status: 409 });
    }

    const cupon = await prisma.cupon.create({
      data: {
        tenantId: context.tenantId,
        ...validation.data,
        fechaInicio: new Date(validation.data.fechaInicio),
        fechaFin: new Date(validation.data.fechaFin),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Cupon",
        entidadId: cupon.id,
        valorNuevo: cupon as any,
      },
    });

    return NextResponse.json({ success: true, cupon }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/marketing/cupones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}