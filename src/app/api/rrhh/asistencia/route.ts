import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AsistenciaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/rrhh/asistencia — Registrar entrada/salida
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { empleadoId, turnoId, tipo } = body; // tipo: "entrada" | "salida"

    if (!empleadoId || !tipo) {
      return NextResponse.json({ error: "empleadoId y tipo son requeridos" }, { status: 400 });
    }

    const empleado = await prisma.empleado.findFirst({
      where: { id: empleadoId, tenantId: context.tenantId },
    });
    if (!empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (tipo === "entrada") {
      // Verificar si ya tiene entrada hoy
      const existing = await prisma.asistencia.findFirst({
        where: { empleadoId, entrada: { gte: hoy } },
      });
      if (existing) {
        return NextResponse.json({ error: "Ya registró entrada hoy" }, { status: 409 });
      }

      const asistencia = await prisma.asistencia.create({
        data: {
          tenantId: context.tenantId,
          empleadoId,
          turnoId,
          entrada: now,
        },
      });

      if (turnoId) {
        await prisma.turno.update({ where: { id: turnoId }, data: { estado: "en_curso" } });
      }

      return NextResponse.json({ success: true, asistencia, tipo: "entrada" }, { status: 201 });
    }

    if (tipo === "salida") {
      const asistencia = await prisma.asistencia.findFirst({
        where: { empleadoId, entrada: { gte: hoy }, salida: null },
        orderBy: { entrada: "desc" },
      });

      if (!asistencia) {
        return NextResponse.json({ error: "No hay entrada registrada para hoy" }, { status: 404 });
      }

      const horasTrabajadas = (now.getTime() - new Date(asistencia.entrada!).getTime()) / (1000 * 60 * 60);

      const updated = await prisma.asistencia.update({
        where: { id: asistencia.id },
        data: { salida: now, horasTrabajadas: Math.round(horasTrabajadas * 100) / 100 },
      });

      if (asistencia.turnoId) {
        await prisma.turno.update({ where: { id: asistencia.turnoId }, data: { estado: "completado" } });
      }

      return NextResponse.json({ success: true, asistencia: updated, tipo: "salida" });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("Error POST /api/rrhh/asistencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// GET /api/rrhh/asistencia — Listar asistencias
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const empleadoId = searchParams.get("empleadoId") || undefined;
    const desde = searchParams.get("desde") || undefined;
    const hasta = searchParams.get("hasta") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (empleadoId) where.empleadoId = empleadoId;
    if (desde || hasta) {
      where.entrada = {};
      if (desde) (where.entrada as Record<string, Date>).gte = new Date(desde);
      if (hasta) (where.entrada as Record<string, Date>).lte = new Date(hasta);
    }

    const [asistencias, total] = await Promise.all([
      prisma.asistencia.findMany({
        where,
        include: {
          empleado: { include: { usuario: { select: { nombre: true } } } },
          turno: true,
        },
        orderBy: { entrada: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asistencia.count({ where }),
    ]);

    return NextResponse.json({
      data: asistencias,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/rrhh/asistencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}