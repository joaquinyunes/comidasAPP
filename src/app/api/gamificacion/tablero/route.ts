export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [pedidosMozo, anulaciones, itemsCocidos] = await Promise.all([
    prisma.pedido.groupBy({
      by: ["mozoId"],
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde }, mozoId: { not: null } },
      _count: { _all: true },
    }),
    prisma.anulacion.findMany({
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde } },
      select: { usuarioId: true },
    }),
    prisma.pedidoItem.findMany({
      where: { tenantId: ctx.tenantId, createdAt: { gte: desde }, horaEnviado: { not: null }, horaListo: { not: null } },
      select: { horaEnviado: true, horaListo: true },
    }),
  ]);

  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: [...pedidosMozo.map((p) => p.mozoId!), ...anulaciones.map((a) => a.usuarioId)] } },
    select: { id: true, nombre: true },
  });
  const mapaU = new Map(usuarios.map((u) => [u.id, u.nombre]));

  const ranking = pedidosMozo
    .map((p) => ({ mozo: mapaU.get(p.mozoId!) ?? p.mozoId, pedidos: p._count._all }))
    .sort((a, b) => b.pedidos - a.pedidos);

  const errores: Record<string, number> = {};
  for (const a of anulaciones) errores[a.usuarioId] = (errores[a.usuarioId] ?? 0) + 1;
  const ceroErrores = Object.entries(errores)
    .map(([uid, n]) => ({ usuario: mapaU.get(uid) ?? uid, anulaciones: n }))
    .sort((a, b) => a.anulaciones - b.anulaciones);

  let total = 0, n = 0;
  for (const it of itemsCocidos) {
    if (it.horaEnviado && it.horaListo) { total += (it.horaListo.getTime() - it.horaEnviado.getTime()) / 60000; n++; }
  }
  const tiempoPromedioMin = n ? Math.round((total / n) * 10) / 10 : 0;

  return NextResponse.json({ data: { ranking, ceroErrores, tiempoPromedioMin } });
}
