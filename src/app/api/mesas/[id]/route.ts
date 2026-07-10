import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MesaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/mesas/[id] — Obtener mesa
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const mesa = await prisma.mesa.findFirst({
      where: { id, tenantId: context.tenantId },
      include: {
        sector: true,
        sucursal: true,
        pedidos: {
          where: { estado: { in: ["recibido", "aceptado", "en_preparacion", "listo", "entregado", "esperando_cuenta"] } },
          include: { items: { include: { producto: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: mesa });
  } catch (error) {
    console.error("Error GET /api/mesas/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// PUT /api/mesas/[id] — Actualizar mesa
// ============================================
export async function PUT(
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
    const validation = validateInput(MesaSchema.partial(), body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const mesa = await prisma.mesa.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    // Si cambia el número, verificar unicidad
    if (validation.data.numero && validation.data.numero !== mesa.numero) {
      const existing = await prisma.mesa.findFirst({
        where: {
          tenantId: context.tenantId,
          sucursalId: mesa.sucursalId,
          numero: validation.data.numero,
          NOT: { id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Ya existe una mesa con ese número" }, { status: 409 });
      }
    }

    const updated = await prisma.mesa.update({
      where: { id },
      data: validation.data,
      include: { sector: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "ACTUALIZAR",
        entidad: "Mesa",
        entidadId: id,
        valorAnterior: mesa as any,
        valorNuevo: updated as any,
      },
    });

    return NextResponse.json({ success: true, mesa: updated });
  } catch (error) {
    console.error("Error PUT /api/mesas/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// PATCH /api/mesas/[id]/estado — Cambiar estado
// ============================================
export async function PATCH(
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
    const { estado } = body;

    const estadosValidos = [
      "libre", "esperando_pedido", "en_cocina", "comiendo",
      "esperando_cuenta", "reservada", "limpieza"
    ];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const mesa = await prisma.mesa.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    const updated = await prisma.mesa.update({
      where: { id },
      data: { estado },
      include: { sector: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CAMBIO_ESTADO",
        entidad: "Mesa",
        entidadId: id,
        valorAnterior: { estado: mesa.estado },
        valorNuevo: { estado },
      },
    });

    return NextResponse.json({ success: true, mesa: updated });
  } catch (error) {
    console.error("Error PATCH /api/mesas/[id]/estado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// DELETE /api/mesas/[id] — Eliminar mesa (soft delete)
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const mesa = await prisma.mesa.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    // Verificar que no tenga pedidos activos
    const pedidosActivos = await prisma.pedido.count({
      where: {
        mesaId: id,
        estado: { in: ["recibido", "aceptado", "en_preparacion", "listo", "entregado", "esperando_cuenta"] },
      },
    });

    if (pedidosActivos > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una mesa con pedidos activos" },
        { status: 409 }
      );
    }

    await prisma.mesa.update({
      where: { id },
      data: { activa: false, estado: "libre" },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "ELIMINAR",
        entidad: "Mesa",
        entidadId: id,
        valorAnterior: mesa as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE /api/mesas/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}