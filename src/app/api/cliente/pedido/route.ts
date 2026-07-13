export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientePedidoSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = ClientePedidoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });
  }
  const { mesaId, clienteId, items } = parsed.data;

  const mesa = await prisma.mesa.findFirst({ where: { id: mesaId } });
  if (!mesa) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });

  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((i) => i.productoId) }, tenantId: mesa.tenantId },
    select: { id: true, precio: true, disponible: true, nombre: true },
  });
  const mapa = new Map(productos.map((p) => [p.id, p]));
  for (const it of items) {
    const p = mapa.get(it.productoId);
    if (!p) return NextResponse.json({ error: `Producto ${it.productoId} no existe` }, { status: 404 });
    if (!p.disponible) return NextResponse.json({ error: `Producto ${p.nombre} no disponible` }, { status: 409 });
  }

  const pedidoItems = items.map((it) => {
    const p = mapa.get(it.productoId)!;
    const precio = Number(p.precio);
    const subtotal = Math.round(precio * it.cantidad * 100) / 100;
    return {
      tenantId: mesa.tenantId,
      productoId: p.id,
      cantidad: it.cantidad,
      precioUnitario: precio,
      subtotal,
      notas: it.notas ?? null,
      estado: "recibido",
    };
  });
  const total = Math.round(pedidoItems.reduce((a, b) => a + Number(b.subtotal), 0) * 100) / 100;

  const pedido = await prisma.pedido.create({
    data: {
      tenantId: mesa.tenantId,
      sucursalId: mesa.sucursalId,
      mesaId,
      clienteId: clienteId ?? null,
      estado: "abierto",
      total,
      items: { create: pedidoItems },
    },
    include: { items: { select: { id: true, productoId: true, cantidad: true, estado: true } } },
  });

  return NextResponse.json({
    data: {
      pedidoId: pedido.id,
      estado: pedido.estado,
      total,
      items: pedido.items,
      mensaje: "Pedido confirmado. Lo preparan en cocina.",
    },
  }, { status: 201 });
}
