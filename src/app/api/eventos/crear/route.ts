export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

const ItemSchema = z.object({ productoId: z.string().uuid(), cantidad: z.number().int().positive().default(1) });
const Schema = z.object({
  sucursalId: z.string().uuid(),
  mesaId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  horaProgramada: z.string(),
  notas: z.string().max(300).optional(),
  items: z.array(ItemSchema).min(1),
});

export async function POST(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });

  const { sucursalId, mesaId, clienteId, horaProgramada, notas, items } = parsed.data;
  const productos = await prisma.producto.findMany({ where: { id: { in: items.map((i) => i.productoId) }, tenantId: ctx.tenantId } });
  const mapa = new Map(productos.map((p) => [p.id, p]));

  const pedidoItems = items.map((it) => {
    const p = mapa.get(it.productoId)!;
    const precio = Number(p.precio);
    return { tenantId: ctx.tenantId, productoId: p.id, cantidad: it.cantidad, precioUnitario: precio, subtotal: Math.round(precio * it.cantidad * 100) / 100, estado: "recibido" };
  });
  const total = Math.round(pedidoItems.reduce((a, b) => a + Number(b.subtotal), 0) * 100) / 100;

  const pedido = await prisma.pedido.create({
    data: { tenantId: ctx.tenantId, sucursalId, mesaId: mesaId ?? null, clienteId: clienteId ?? null, tipo: "evento", horaProgramada: new Date(horaProgramada), notas: notas ?? null, total, items: { create: pedidoItems } },
  });

  return NextResponse.json({ data: { pedidoId: pedido.id, estado: pedido.estado } }, { status: 201 });
}
