export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";
import { puedeTransicionarPedido } from "@/lib/pedidos/transicion-permitida";

const Schema = z.object({
  pedidoId: z.string().uuid(),
  empleadoId: z.string().uuid(),
  zonaId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });

  const pedido = await prisma.pedido.findFirst({ where: { id: parsed.data.pedidoId, tenantId: ctx.tenantId } });
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const veredicto = puedeTransicionarPedido({ actual: pedido.estado, nuevo: "en_delivery", total: Number(pedido.total), permisos: ctx.permisos });
  if (!veredicto.ok) return NextResponse.json({ error: veredicto.error }, { status: veredicto.status });

  // El repartidor y la zona tienen que ser de ESTE restaurante (los ids vienen del cliente).
  const empleado = await prisma.empleado.findFirst({ where: { id: parsed.data.empleadoId, tenantId: ctx.tenantId }, select: { id: true } });
  if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
  if (parsed.data.zonaId) {
    const zona = await prisma.zonaReparto.findFirst({ where: { id: parsed.data.zonaId, tenantId: ctx.tenantId }, select: { id: true } });
    if (!zona) return NextResponse.json({ error: "Zona no encontrada" }, { status: 404 });
  }

  const asignacion = await prisma.asignacionReparto.create({
    data: { tenantId: ctx.tenantId, pedidoId: pedido.id, empleadoId: parsed.data.empleadoId, zonaId: parsed.data.zonaId ?? null, estado: "asignado" },
  });

  await prisma.pedido.update({ where: { id: pedido.id }, data: { estado: "en_delivery" } });

  return NextResponse.json({ data: asignacion }, { status: 201 });
}
