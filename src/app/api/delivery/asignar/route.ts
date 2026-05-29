export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

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

  const asignacion = await prisma.asignacionReparto.create({
    data: { tenantId: ctx.tenantId, pedidoId: pedido.id, empleadoId: parsed.data.empleadoId, zonaId: parsed.data.zonaId ?? null, estado: "asignado" },
  });

  await prisma.pedido.update({ where: { id: pedido.id }, data: { estado: "en_delivery" } });

  return NextResponse.json({ data: asignacion }, { status: 201 });
}
