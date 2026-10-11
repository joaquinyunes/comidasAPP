import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import type { PedidoEstado } from "@/types";
import { ClientePedidoSchema } from "@/lib/validation";
import { crearPedidoCliente } from "@/lib/pedidos/crear";
import { tienePermiso } from "@/lib/panel/permisos";

// ============================================
// GET /api/pedidos - Listar pedidos (con micro-fases)
// ============================================
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mesaId = searchParams.get("mesaId");
  const estado = searchParams.get("estado");

  const where: Record<string, unknown> = { tenantId: ctx.tenantId };
  if (mesaId) where.mesaId = mesaId;
  if (estado) where.estado = estado;

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      mesa: true,
      cliente: true,
      items: { include: { producto: true } },
      eventos: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = pedidos.map((p) => ({
    id: p.id,
    mesaId: p.mesa?.numero ?? p.mesaId,
    mesaNumero: p.mesa?.numero,
    clienteId: p.clienteId,
    clienteNombre: p.cliente?.nombre,
    estado: p.estado as PedidoEstado,
    tipo: p.tipo,
    total: Number(p.total),
    notas: p.notas,
    items: p.items.map((i) => ({
      id: i.id,
      productoId: i.productoId,
      productoNombre: i.producto?.nombre ?? i.productoId,
      cantidad: i.cantidad,
      precioUnitario: Number(i.precioUnitario),
      subtotal: Number(i.subtotal),
      notas: i.notas,
      estado: i.estado as PedidoEstado,
      horaEnviado: i.horaEnviado,
      horaListo: i.horaListo,
      horaEntregado: i.horaEntregado,
      anulado: i.anulado,
      urgente: i.urgente,
    })),
    microFases: p.eventos.map((e) => ({
      evento: e.evento,
      createdAt: e.createdAt,
      usuarioId: e.usuarioId,
    })),
    createdAt: p.createdAt,
  }));

  return NextResponse.json(data);
}

// ============================================
// POST /api/pedidos - El mozo toma un pedido desde el panel
//
// Misma lógica que el pedido por QR (precios del servidor, stock,
// cupón, idempotencia), pero con sesión de staff: el pedido queda
// a nombre del mozo que lo tomó.
// ============================================

const HTTP_POR_CODIGO = {
  MESA_NO_ENCONTRADA: 404,
  PRODUCTO_INVALIDO: 409,
  SIN_STOCK: 409,
  CUPON_INVALIDO: 422,
} as const;

export async function POST(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "pedidos:crear")) {
      return NextResponse.json({ error: "No tenés permiso para tomar pedidos." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = ClientePedidoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: parsed.error.flatten() },
        { status: 422 }
      );
    }

    // La mesa tiene que ser del local de quien la toca.
    const mesa = await prisma.mesa.findFirst({
      where: { id: parsed.data.mesaId, tenantId: ctx.tenantId },
      select: { id: true },
    });
    if (!mesa) return NextResponse.json({ error: "La mesa no existe." }, { status: 404 });

    const resultado = await crearPedidoCliente({ ...parsed.data, mozoId: ctx.usuarioId });

    if (!resultado.ok) {
      return NextResponse.json(
        {
          error: resultado.mensaje,
          codigo: resultado.codigo,
          ...(resultado.codigo === "SIN_STOCK" ? { faltantes: resultado.faltantes } : {}),
        },
        { status: HTTP_POR_CODIGO[resultado.codigo] ?? 400 }
      );
    }

    if (!resultado.duplicado) {
      // Efecto secundario best-effort: nunca tumba la respuesta.
      await prisma.mesa
        .updateMany({
          where: { id: mesa.id, estado: { in: ["libre", "reservada", "esperando_pedido"] } },
          data: { estado: "ocupada" },
        })
        .catch((e) => console.error("[POST /api/pedidos] no se pudo marcar la mesa:", e));
    }

    return NextResponse.json(
      {
        data: {
          pedidoId: resultado.pedidoId,
          total: resultado.total,
          duplicado: resultado.duplicado,
        },
      },
      { status: resultado.duplicado ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error POST /api/pedidos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
