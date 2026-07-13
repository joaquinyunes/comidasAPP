import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PedidoSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/pedidos/[id] — Obtener pedido
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

    const pedido = await prisma.pedido.findFirst({
      where: { id, tenantId: context.tenantId },
      include: {
        items: { include: { producto: true, eventos: true } },
        mesa: { include: { sector: true } },
        cliente: true,
        mozo: { select: { nombre: true } },
        pagos: true,
        eventos: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: pedido });
  } catch (error) {
    console.error("Error GET /api/pedidos/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// PUT /api/pedidos/[id]/estado — Actualizar estado del pedido
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
    const { estado, itemId, itemEstado } = body;

    const pedido = await prisma.pedido.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const estadosValidos = ["recibido", "aceptado", "en_preparacion", "listo", "entregado", "esperando_cuenta", "cerrado", "cancelado"];
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // Actualizar estado del item si se proporciona
    if (itemId && itemEstado) {
      await prisma.pedidoItem.update({
        where: { id: itemId, pedidoId: id },
        data: { estado: itemEstado },
      });

      await prisma.pedidoEvento.create({
        data: {
          tenantId: context.tenantId,
          pedidoId: id,
          pedidoItemId: itemId,
          evento: `item_${itemEstado}`,
          usuarioId: context.usuarioId,
        },
      });
    }

    // Actualizar estado del pedido si se proporciona
    let updated = pedido;
    if (estado && estado !== pedido.estado) {
      updated = await prisma.pedido.update({
        where: { id },
        data: { estado },
      });

      await prisma.pedidoEvento.create({
        data: {
          tenantId: context.tenantId,
          pedidoId: id,
          evento: `pedido_${estado}`,
          usuarioId: context.usuarioId,
        },
      });

      // Si el pedido se cierra, actualizar mesa
      if (estado === "cerrado" && pedido.mesaId) {
        await prisma.mesa.update({
          where: { id: pedido.mesaId },
          data: { estado: "limpieza" },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "ACTUALIZAR_ESTADO",
        entidad: "Pedido",
        entidadId: id,
        valorAnterior: { estado: pedido.estado },
        valorNuevo: { estado: estado || pedido.estado },
      },
    });

    return NextResponse.json({ success: true, pedido: updated });
  } catch (error) {
    console.error("Error PUT /api/pedidos/[id]/estado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/pedidos/[id]/items — Agregar item a pedido
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
    const { productoId, cantidad, notas } = body;

    const pedido = await prisma.pedido.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estado === "cerrado" || pedido.estado === "cancelado") {
      return NextResponse.json({ error: "No se pueden agregar items a un pedido cerrado" }, { status: 409 });
    }

    const producto = await prisma.producto.findFirst({
      where: { id: productoId, tenantId: context.tenantId },
    });
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const item = await prisma.pedidoItem.create({
      data: {
        tenantId: context.tenantId,
        pedidoId: id,
        productoId,
        cantidad,
        precioUnitario: Number(producto.precio),
        subtotal: Number(producto.precio) * cantidad,
        notas,
        estado: "recibido",
      },
    });

    // Recalcular total
    const items = await prisma.pedidoItem.findMany({ where: { pedidoId: id } });
    const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
    await prisma.pedido.update({ where: { id }, data: { total } });

    await prisma.pedidoEvento.create({
      data: {
        tenantId: context.tenantId,
        pedidoId: id,
        pedidoItemId: item.id,
        evento: "item_agregado",
        usuarioId: context.usuarioId,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/pedidos/[id]/items:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// DELETE /api/pedidos/[id]/items/[itemId] — Eliminar item de pedido
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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
    }

    const pedido = await prisma.pedido.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estado === "cerrado" || pedido.estado === "cancelado") {
      return NextResponse.json({ error: "No se pueden eliminar items de un pedido cerrado" }, { status: 409 });
    }

    await prisma.pedidoItem.delete({ where: { id: itemId, pedidoId: id } });

    // Recalcular total
    const items = await prisma.pedidoItem.findMany({ where: { pedidoId: id } });
    const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
    await prisma.pedido.update({ where: { id }, data: { total } });

    await prisma.pedidoEvento.create({
      data: {
        tenantId: context.tenantId,
        pedidoId: id,
        pedidoItemId: itemId,
        evento: "item_eliminado",
        usuarioId: context.usuarioId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE /api/pedidos/[id]/items:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}