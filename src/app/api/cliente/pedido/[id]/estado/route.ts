export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MENSAJES: Record<string, string> = {
  recibido: "Recibimos tu pedido. En breve arranca la cocina.",
  pendiente: "Tu pedido está en cola.",
  en_preparacion: "Lo estamos preparando.",
  listo: "¡Listo! El mozo te lo trae.",
  entregado: "Disfrutá tu comida.",
  anulado: "Este item fue anulado.",
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    select: { estado: true, items: { select: { estado: true, anulado: true } } },
  });
  if (!pedido) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const estados = pedido.items.filter((i) => !i.anulado).map((i) => i.estado);
  const total = estados.length;
  const listos = estados.filter((e) => e === "listo" || e === "entregado").length;
  const progreso = total === 0 ? 0 : Math.round((listos / total) * 100);

  return NextResponse.json({
    data: {
      pedidoId: params.id,
      estadoGeneral: pedido.estado,
      mensaje: MENSAJES[pedido.estado] ?? "Pedido en curso.",
      progreso,
      sinApurar: "Todo va bien, no hace falta apurar. Te avisamos cuando esté listo.",
    },
  });
}
