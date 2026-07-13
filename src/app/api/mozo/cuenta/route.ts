export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mesaId = searchParams.get("mesaId");
  if (!mesaId) return NextResponse.json({ error: "mesaId requerido" }, { status: 400 });

  const pedidos = await prisma.pedido.findMany({
    where: { mesaId, tenantId: ctx.tenantId, estado: { in: ["abierto", "en_proceso"] } },
    include: { items: { select: { id: true, subtotal: true, estado: true, anulado: true, producto: { select: { nombre: true } } } } },
  });

  let subtotal = 0;
  for (const p of pedidos) {
    for (const it of p.items) {
      if (!it.anulado) subtotal += Number(it.subtotal);
    }
  }

  const sugerenciaPropina = Math.round(subtotal * 0.1 * 100) / 100;

  return NextResponse.json({
    data: {
      mesaId,
      totalPedidos: pedidos.length,
      subtotal: Math.round(subtotal * 100) / 100,
      sugerenciaPropina,
      totalConPropina: Math.round((subtotal + sugerenciaPropina) * 100) / 100,
    },
  });
}
