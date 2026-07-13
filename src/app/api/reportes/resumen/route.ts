export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [porSucursal, global] = await Promise.all([
    prisma.pedido.groupBy({
      by: ["sucursalId"],
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde } },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.pedido.aggregate({
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde } },
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const sucursales = await prisma.sucursal.findMany({
    where: { tenantId: ctx.tenantId },
    select: { id: true, nombre: true },
  });
  const mapaS = new Map(sucursales.map((s) => [s.id, s.nombre]));

  const comparacion = porSucursal.map((p) => ({
    sucursalId: p.sucursalId,
    nombre: mapaS.get(p.sucursalId) ?? p.sucursalId,
    pedidos: p._count._all,
    facturado: Math.round(Number(p._sum.total ?? 0) * 100) / 100,
  })).sort((a, b) => b.facturado - a.facturado);

  return NextResponse.json({
    data: {
      comparacion,
      totalPedidos: global._count._all,
      totalFacturado: Math.round(Number(global._sum.total ?? 0) * 100) / 100,
      modoDemo: false,
    },
  });
}
