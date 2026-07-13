import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TurnoSchema, AsistenciaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/rrhh/turnos — Listar turnos
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const empleadoId = searchParams.get("empleadoId") || undefined;
    const fecha = searchParams.get("fecha") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;
    if (empleadoId) where.empleadoId = empleadoId;
    if (estado) where.estado = estado;
    if (fecha) {
      where.fecha = new Date(fecha);
    }

    const [turnos, total] = await Promise.all([
      prisma.turno.findMany({
        where,
        include: {
          empleado: {
            include: { usuario: { select: { id: true, nombre: true } } },
          },
          asistencia: true,
        },
        orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.turno.count({ where }),
    ]);

    return NextResponse.json({
      data: turnos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/rrhh/turnos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/rrhh/turnos — Crear turno
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(TurnoSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    // Verificar empleado
    const empleado = await prisma.empleado.findFirst({
      where: { id: validation.data.empleadoId, tenantId: context.tenantId },
    });
    if (!empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    // Verificar no hay solapamiento
    const solapamiento = await prisma.turno.findFirst({
      where: {
        empleadoId: validation.data.empleadoId,
        fecha: new Date(validation.data.fecha),
        estado: { notIn: ["cancelado", "completado"] },
        OR: [
          { horaInicio: { lt: new Date(`1970-01-01T${validation.data.horaFin}:00`) }, horaFin: { gt: new Date(`1970-01-01T${validation.data.horaInicio}:00`) } },
        ],
      },
    });
    if (solapamiento) {
      return NextResponse.json({ error: "El empleado ya tiene un turno en ese horario" }, { status: 409 });
    }

    const turno = await prisma.turno.create({
      data: {
        tenantId: context.tenantId,
        ...validation.data,
        fecha: new Date(validation.data.fecha),
        horaInicio: new Date(`1970-01-01T${validation.data.horaInicio}:00`),
        horaFin: new Date(`1970-01-01T${validation.data.horaFin}:00`),
      },
      include: {
        empleado: { include: { usuario: { select: { nombre: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Turno",
        entidadId: turno.id,
        valorNuevo: turno as any,
      },
    });

    return NextResponse.json({ success: true, turno }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/rrhh/turnos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}