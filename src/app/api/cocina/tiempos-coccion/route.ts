export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await prisma.pedidoItem.findMany({
    where: {
      tenantId: ctx.tenantId,
      horaEnviado: { not: null },
      horaListo: { not: null },
      anulado: false,
    },
    include: { producto: { select: { nombre: true, estacion: true } } },
    orderBy: { horaListo: "desc" },
    take: 1000,
  });

  const acum: Record<string, { producto: string; estacion: string | null; total: number; n: number }> = {};
  for (const it of items) {
    const key = `${it.productoId}`;
    if (!acum[key]) acum[key] = { producto: it.producto.nombre, estacion: it.producto.estacion, total: 0, n: 0 };
    const diffMs = it.horaListo!.getTime() - it.horaEnviado!.getTime();
    acum[key].total += diffMs / 60000;
    acum[key].n += 1;
  }

  const datos = Object.values(acum)
    .map((a) => ({ producto: a.producto, estacion: a.estacion, promedioMin: Math.round((a.total / a.n) * 10) / 10 }))
    .sort((x, y) => y.promedioMin - x.promedioMin);

  return NextResponse.json({ data: datos });
}
