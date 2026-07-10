import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmpleadoSchema, TurnoSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/rrhh/empleados — Listar empleados
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const estado = searchParams.get("estado") || undefined;
    const busqueda = searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;
    if (estado) where.estado = estado;
    if (busqueda) {
      where.OR = [
        { usuario: { nombre: { contains: busqueda, mode: "insensitive" } } },
        { cargo: { contains: busqueda, mode: "insensitive" } },
      ];
    }

    const [empleados, total] = await Promise.all([
      prisma.empleado.findMany({
        where,
        include: {
          usuario: { select: { id: true, nombre: true, email: true, telefono: true, avatarUrl: true } },
          sucursal: { select: { id: true, nombre: true } },
          _count: { select: { turnos: true, asistencia: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.empleado.count({ where }),
    ]);

    return NextResponse.json({
      data: empleados,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/rrhh/empleados:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/rrhh/empleados — Crear empleado
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { usuarioId, sucursalId, ...resto } = body;

    if (!usuarioId || !sucursalId) {
      return NextResponse.json({ error: "usuarioId y sucursalId son requeridos" }, { status: 400 });
    }

    const validation = validateInput(EmpleadoSchema, { usuarioId, sucursalId, ...resto });
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    // Verificar usuario existe y no tiene empleado
    const usuario = await prisma.usuario.findFirst({
      where: { id: usuarioId, tenantId: context.tenantId },
    });
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const existing = await prisma.empleado.findUnique({ where: { usuarioId } });
    if (existing) {
      return NextResponse.json({ error: "El usuario ya tiene un perfil de empleado" }, { status: 409 });
    }

    const empleado = await prisma.empleado.create({
      data: {
        tenantId: context.tenantId,
        ...validation.data,
      },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        sucursal: { select: { id: true, nombre: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Empleado",
        entidadId: empleado.id,
        valorNuevo: empleado as any,
      },
    });

    return NextResponse.json({ success: true, empleado }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/rrhh/empleados:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}