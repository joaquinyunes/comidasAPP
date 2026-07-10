import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/reservas — Listar reservas
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;
    if (estado) where.estado = estado;
    if (fecha) {
      where.fecha = new Date(fecha);
    }

    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where,
        include: {
          mesa: true,
          cliente: true,
          sucursal: true,
        },
        orderBy: [{ fecha: "asc" }, { hora: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reserva.count({ where }),
    ]);

    return NextResponse.json({
      data: reservas,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/reservas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/reservas — Crear reserva
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(ReservaSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const { clienteNombre, clienteTelefono, clienteEmail, fecha, hora, cantidadPersonas, sector, occasion, notas, mesaId } = validation.data;

    const sucursalId = context.sucursalId || body.sucursalId;
    if (!sucursalId) {
      return NextResponse.json({ error: "Se requiere sucursalId" }, { status: 400 });
    }

    // Verificar mesa si se proporciona
    if (mesaId) {
      const mesa = await prisma.mesa.findFirst({
        where: { id: mesaId, tenantId: context.tenantId, sucursalId, activa: true },
      });
      if (!mesa) {
        return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
      }
      if (mesa.capacidad < cantidadPersonas) {
        return NextResponse.json({ error: "La mesa no tiene capacidad suficiente" }, { status: 400 });
      }
      // Verificar disponibilidad
      const conflicto = await prisma.reserva.findFirst({
        where: {
          mesaId,
          fecha: new Date(fecha),
          hora: new Date(`1970-01-01T${hora}:00`),
          estado: { in: ["pendiente", "confirmada"] },
        },
      });
      if (conflicto) {
        return NextResponse.json({ error: "La mesa ya está reservada en ese horario" }, { status: 409 });
      }
    }

    // Buscar o crear cliente
    let cliente = null;
    if (clienteEmail) {
      cliente = await prisma.cliente.findFirst({
        where: { email: clienteEmail, tenantId: context.tenantId },
      });
    }
    if (!cliente && clienteTelefono) {
      cliente = await prisma.cliente.findFirst({
        where: { telefono: clienteTelefono, tenantId: context.tenantId },
      });
    }
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          tenantId: context.tenantId,
          nombre: clienteNombre,
          telefono: clienteTelefono,
          email: clienteEmail,
        },
      });
    }

    const reserva = await prisma.reserva.create({
      data: {
        tenantId: context.tenantId,
        sucursalId,
        clienteId: cliente.id,
        mesaId,
        fecha: new Date(fecha),
        hora: new Date(`1970-01-01T${hora}:00`),
        cantidadPersonas,
        zona: sector,
        occasion,
        notas,
        estado: "pendiente",
      },
      include: { mesa: true, cliente: true, sucursal: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Reserva",
        entidadId: reserva.id,
        valorNuevo: reserva as any,
      },
    });

    return NextResponse.json({ success: true, reserva }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/reservas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}