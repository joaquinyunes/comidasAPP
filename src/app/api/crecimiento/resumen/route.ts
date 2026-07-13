export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

const PLANES = [
  { clave: "STARTER", nombre: "Starter", precio: 0, modulos: ["PEDIDOS"] },
  { clave: "PRO", nombre: "Pro", precio: 49, modulos: ["PEDIDOS", "DELIVERY", "MULTISUCURSAL"] },
  { clave: "ENTERPRISE", nombre: "Enterprise", precio: 199, modulos: ["PEDIDOS", "DELIVERY", "MULTISUCURSAL", "PROVEEDORES", "WHITELABEL"] },
];

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [modulos, ventas] = await Promise.all([
    prisma.modulo.findMany({ where: { tenantId: ctx.tenantId }, select: { clave: true, nombre: true, activo: true } }),
    prisma.pedido.aggregate({ where: { tenantId: ctx.tenantId, createdAt: { gte: desde } }, _count: { _all: true }, _sum: { total: true } }),
  ]);

  return NextResponse.json({
    data: {
      planes: PLANES,
      modulosActivos: modulos.filter((m) => m.activo).map((m) => m.clave),
      metricas: {
        pedidos30d: ventas._count._all,
        facturado30d: Math.round(Number(ventas._sum.total ?? 0) * 100) / 100,
      },
    },
  });
}
