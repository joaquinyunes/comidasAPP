export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const eventos = await prisma.pedido.findMany({
    where: { tenantId: ctx.tenantId, tipo: "evento" },
    include: {
      mesa: { select: { numero: true } },
      cliente: { select: { nombre: true } },
      items: { select: { id: true, estado: true, cantidad: true, producto: { select: { nombre: true } } } },
    },
    orderBy: { horaProgramada: "asc" },
  });

  return NextResponse.json({
    data: eventos.map((e) => ({
      id: e.id,
      estado: e.estado,
      horaProgramada: e.horaProgramada,
      cliente: e.cliente?.nombre ?? (e.mesa ? `Mesa ${e.mesa.numero}` : "—"),
      cubiertos: e.items.reduce((a, b) => a + b.cantidad, 0),
      pendientesCocina: e.items.filter((i) => i.estado !== "entregado" && i.estado !== "anulado").length,
    })),
  });
}
