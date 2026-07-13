export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const desde24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const desde30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [pedidos24h, anulaciones, mesasOcupadas, productos, ultimoPedido] = await Promise.all([
    prisma.pedido.count({ where: { tenantId: ctx.tenantId, createdAt: { gte: desde24h } } }),
    prisma.anulacion.count({ where: { tenantId: ctx.tenantId, createdAt: { gte: desde30d } } }),
    prisma.mesa.count({ where: { tenantId: ctx.tenantId, estado: "ocupada" } }),
    prisma.producto.count({ where: { tenantId: ctx.tenantId, disponible: true } }),
    prisma.pedido.findFirst({ where: { tenantId: ctx.tenantId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ]);

  const modoSoloCobro = false;
  const integridadOk = productos > 0;

  return NextResponse.json({
    data: {
      pedidos24h,
      anulaciones30d: anulaciones,
      mesasOcupadas,
      productosActivos: productos,
      ultimoPedido: ultimoPedido?.createdAt ?? null,
      modoSoloCobro,
      integridadOk,
      recomendacion: modoSoloCobro ? "Operando en modo solo-cobro: cerrá mesas sin cocina." : "Sistema operativo. Tené un plan de contingencia listo.",
    },
  });
}
