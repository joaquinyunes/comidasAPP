export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [anulaciones, itemsCocidos, stock, mesas, pedidosMozo] = await Promise.all([
    prisma.anulacion.findMany({
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde } },
      select: { motivo: true },
    }),
    prisma.pedidoItem.findMany({
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde }, horaEnviado: { not: null }, horaListo: { not: null } },
      select: { horaEnviado: true, horaListo: true },
    }),
    prisma.stockPorSucursal.findMany({
      where: { tenantId: ctx.tenantId },
      include: { ingrediente: { select: { nombre: true, stockMinimo: true } } },
    }),
    prisma.mesa.findMany({
      where: { tenantId: ctx.tenantId, estado: "ocupada" },
      select: {
        id: true,
        numero: true,
        pedidos: { where: { estado: { in: ["abierto", "en_proceso"] } }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    }),
    prisma.pedido.groupBy({
      by: ["mozoId"],
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde }, mozoId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const porMotivo: Record<string, number> = {};
  for (const a of anulaciones) porMotivo[a.motivo] = (porMotivo[a.motivo] ?? 0) + 1;

  let totalMin = 0;
  let n = 0;
  for (const it of itemsCocidos) {
    if (it.horaEnviado && it.horaListo) {
      totalMin += (it.horaListo.getTime() - it.horaEnviado.getTime()) / 60000;
      n += 1;
    }
  }
  const tiempoPromedioMin = n ? Math.round((totalMin / n) * 10) / 10 : 0;

  const quiebres = stock.filter((s) => {
    const minimo = s.ingrediente.stockMinimo ? Number(s.ingrediente.stockMinimo) : 0;
    return minimo > 0 && Number(s.cantidadActual) <= minimo;
  });

  const ahora = Date.now();
  const mesasDesatendidas = mesas
    .filter((m) => !m.pedidos[0] || ahora - m.pedidos[0].createdAt.getTime() > 15 * 60 * 1000)
    .map((m) => m.numero);

  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: pedidosMozo.map((p) => p.mozoId!).filter(Boolean) } },
    select: { id: true, nombre: true },
  });
  const mapaU = new Map(usuarios.map((u) => [u.id, u.nombre]));
  const rendimiento = pedidosMozo
    .map((p) => ({ mozo: mapaU.get(p.mozoId!) ?? p.mozoId, pedidos: p._count._all }))
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, 5);

  return NextResponse.json({
    data: {
      platosDevueltos: anulaciones.length,
      porMotivo,
      tiempoPromedioServicioMin: tiempoPromedioMin,
      mermas: quiebres.length,
      mesasDesatendidas,
      rendimiento,
    },
  });
}
