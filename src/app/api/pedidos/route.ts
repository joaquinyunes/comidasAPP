import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import type { PedidoEstado } from "@/types";

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
// POST /api/pedidos - Crear pedido
// ============================================
export async function POST(request: Request) {
  const body = await request.json();

  // TODO: Validar con Zod, verificar stock, guardar en Prisma
  const nuevoPedido = {
    id: crypto.randomUUID(),
    ...body,
    estado: "recibido",
    total: body.items?.reduce((sum: number, item: any) => sum + item.subtotal, 0) || 0,
    createdAt: new Date(),
  };

  return NextResponse.json(nuevoPedido, { status: 201 });
}
