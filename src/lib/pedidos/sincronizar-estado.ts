// ============================================================
// Mantiene el estado del pedido alineado con el de sus ítems.
// Cuando la cocina mueve los ítems, el pedido "sube" solo.
// Nunca retrocede ni toca pedidos pagados/cancelados.
// ============================================================

import type { Prisma } from "@/generated/prisma/client";
import { estadoPedidoDerivado } from "./progreso";
import { puedeTransicionarPedido } from "./estados";

export async function sincronizarEstadoPedido(
  db: Prisma.TransactionClient,
  pedidoId: string
): Promise<string | null> {
  const pedido = await db.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      tenantId: true,
      estado: true,
      items: { select: { estado: true, anulado: true } },
    },
  });
  if (!pedido) return null;
  if (pedido.estado === "pagado" || pedido.estado === "cancelado") return pedido.estado;

  const derivado = estadoPedidoDerivado(pedido.items);
  if (!derivado || derivado === pedido.estado) return pedido.estado;

  // Solo avanzamos si la máquina de estados lo permite (nunca hacia atrás).
  if (!puedeTransicionarPedido(pedido.estado, derivado)) return pedido.estado;

  await db.pedido.update({ where: { id: pedidoId }, data: { estado: derivado } });
  await db.pedidoEvento.create({
    data: {
      tenantId: pedido.tenantId,
      pedidoId,
      evento: `ESTADO_${derivado.toUpperCase()}`,
      metadata: { origen: "sincronizacion_items" },
    },
  });
  return derivado;
}
