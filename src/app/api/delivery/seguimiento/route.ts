export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const asignaciones = await prisma.asignacionReparto.findMany({
    where: { tenantId: ctx.tenantId },
    include: {
      empleado: { select: { id: true, usuario: { select: { nombre: true } } } },
      zona: { select: { nombre: true, tiempoEstimadoMin: true } },
      pedido: { select: { id: true, total: true, mesa: { select: { numero: true } }, cliente: { select: { nombre: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const zonas = await prisma.zonaReparto.findMany({
    where: { tenantId: ctx.tenantId, activa: true },
    select: { id: true, nombre: true, tiempoEstimadoMin: true },
  });

  return NextResponse.json({
    data: {
      asignaciones: asignaciones.map((a) => ({
        id: a.id,
        estado: a.estado,
        empleado: a.empleado?.usuario?.nombre ?? "—",
        zona: a.zona?.nombre ?? "—",
        cliente: a.pedido.cliente?.nombre ?? (a.pedido.mesa ? `Mesa ${a.pedido.mesa.numero}` : "—"),
        total: Number(a.pedido.total),
        horaSalida: a.horaSalida,
        horaEntrega: a.horaEntrega,
      })),
      zonas,
    },
  });
}
