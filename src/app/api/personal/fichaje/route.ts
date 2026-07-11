import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FichajeSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/personal/fichaje — Registrar entrada/salida/break
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(FichajeSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }
    const { empleadoId, turnoId, tipo } = validation.data;

    const empleado = await prisma.empleado.findFirst({
      where: { id: empleadoId, tenantId: context.tenantId },
    });
    if (!empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ENTRADA: abre un nuevo registro de asistencia del día
    if (tipo === "ENTRADA") {
      const abierto = await prisma.asistencia.findFirst({
        where: { empleadoId, entrada: { gte: hoy }, salida: null },
      });
      if (abierto) {
        return NextResponse.json({ error: "El empleado ya tiene una entrada activa hoy" }, { status: 409 });
      }
      const asistencia = await prisma.asistencia.create({
        data: {
          tenantId: context.tenantId,
          empleadoId,
          turnoId,
          sucursalId: context.sucursalId,
          tipo: "ENTRADA",
          entrada: now,
        },
      });
      if (turnoId) {
        await prisma.turno.update({ where: { id: turnoId }, data: { estado: "en_curso" } });
      }
      return NextResponse.json({ success: true, asistencia, tipo }, { status: 201 });
    }

    // SALIDA: cierra el registro abierto del día
    if (tipo === "SALIDA") {
      const abierto = await prisma.asistencia.findFirst({
        where: { empleadoId, entrada: { gte: hoy }, salida: null },
        orderBy: { entrada: "desc" },
      });
      if (!abierto) {
        return NextResponse.json({ error: "No hay entrada activa para hoy" }, { status: 404 });
      }
      const horas =
        (now.getTime() - new Date(abierto.entrada!).getTime()) / (1000 * 60 * 60);
      const actualizado = await prisma.asistencia.update({
        where: { id: abierto.id },
        data: { salida: now, tipo: "SALIDA", horasTrabajadas: Math.round(horas * 100) / 100 },
      });
      if (abierto.turnoId) {
        await prisma.turno.update({ where: { id: abierto.turnoId }, data: { estado: "completado" } });
      }
      return NextResponse.json({ success: true, asistencia: actualizado, tipo });
    }

    // BREAK_IN / BREAK_OUT: marca pausa en el registro abierto
    const abierto = await prisma.asistencia.findFirst({
      where: { empleadoId, entrada: { gte: hoy }, salida: null },
      orderBy: { entrada: "desc" },
    });
    if (!abierto) {
      return NextResponse.json({ error: "No hay entrada activa para registrar el break" }, { status: 404 });
    }
    const actualizado = await prisma.asistencia.update({
      where: { id: abierto.id },
      data: tipo === "BREAK_IN" ? { breakInicio: now, tipo: "BREAK_IN" } : { breakFin: now, tipo: "BREAK_OUT" },
    });
    return NextResponse.json({ success: true, asistencia: actualizado, tipo });
  } catch (error) {
    console.error("Error POST /api/personal/fichaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// GET /api/personal/fichaje — Plantel en vivo (hoy)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const where: Record<string, unknown> = { tenantId: context.tenantId, estado: "activo" };
    if (sucursalId) where.sucursalId = sucursalId;

    const empleados = await prisma.empleado.findMany({
      where,
      include: {
        usuario: { select: { id: true, nombre: true } },
        sucursal: { select: { id: true, nombre: true } },
        asistencia: {
          where: { entrada: { gte: hoy } },
          orderBy: { entrada: "desc" },
          take: 1,
        },
        turnos: {
          where: { fecha: hoy, estado: { in: ["asignado", "confirmado", "en_curso"] } },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const plantel = empleados.map((e) => {
      const a = e.asistencia[0];
      let estado = "sin_fichar";
      if (a) {
        if (!a.salida && a.breakInicio && !a.breakFin) estado = "en_break";
        else if (!a.salida) estado = "trabajando";
        else estado = "finalizo";
      } else if (e.turnos.length > 0) {
        estado = "con_turno";
      }
      return {
        empleadoId: e.id,
        nombre: e.usuario.nombre,
        cargo: e.cargo,
        sucursal: e.sucursal?.nombre,
        estado,
        entrada: a?.entrada ?? null,
        breakInicio: a?.breakInicio ?? null,
        salida: a?.salida ?? null,
        horasTrabajadas: a?.horasTrabajadas ?? null,
      };
    });

    return NextResponse.json({ data: plantel, fecha: hoy.toISOString() });
  } catch (error) {
    console.error("Error GET /api/personal/fichaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
