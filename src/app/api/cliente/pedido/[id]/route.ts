export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      estado: true,
      total: true,
      creadoEn: true,
      pedidoItems: {
        select: {
          id: true,
          estado: true,
          cantidad: true,
          notas: true,
          anulado: true,
          producto: { select: { nombre: true } },
        },
      },
    },
  });
  if (!pedido) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({
    data: {
      pedidoId: pedido.id,
      estado: pedido.estado,
      total: Number(pedido.total),
      creadoEn: pedido.creadoEn,
      items: pedido.pedidoItems.map((it) => ({
        nombre: it.producto.nombre,
        cantidad: it.cantidad,
        estado: it.estado,
        notas: it.notas,
        anulado: it.anulado,
      })),
    },
  });
}
