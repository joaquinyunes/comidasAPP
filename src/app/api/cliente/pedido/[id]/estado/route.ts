export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mensajeCliente, SIN_APURAR } from "@/lib/pedidos/mensajes-cliente";
import { progresoPedido } from "@/lib/pedidos/progreso";
import { redondear2 } from "@/lib/pedidos/precio";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: {
      estado: true,
      total: true,
      items: { select: { estado: true, anulado: true } },
      pagos: { where: { estado: "completado" }, select: { monto: true, propina: true } },
    },
  });
  if (!pedido) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const total = Number(pedido.total);
  const pagadoConsumo = redondear2(
    pedido.pagos.reduce((acc, p) => acc + (Number(p.monto) - Number(p.propina)), 0)
  );
  const saldoPendiente = redondear2(Math.max(0, total - pagadoConsumo));
  const pagado = pedido.estado === "pagado" || saldoPendiente <= 0.009;

  return NextResponse.json({
    data: {
      pedidoId: id,
      estadoGeneral: pedido.estado,
      mensaje: mensajeCliente(pedido.estado),
      progreso: progresoPedido(pedido.items),
      total,
      pagadoConsumo,
      saldoPendiente,
      pagos: pedido.pagos.length,
      pagado,
      puedePagar: !pagado && pedido.estado !== "cancelado",
      sinApurar: SIN_APURAR,
    },
  });
}
