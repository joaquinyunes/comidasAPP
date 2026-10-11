// ¿Quedan pedidos abiertos en esta mesa además de uno dado?
// Sirve para no liberar una mesa que todavía tiene otra comanda sin cobrar.

import type { Prisma } from "@/generated/prisma/client";
import type { prisma } from "@/lib/prisma";

const CERRADOS = ["pagado", "cerrado", "cancelado", "anulado"];

type Db = Prisma.TransactionClient | typeof prisma;

export async function mesaSinPendientes(
  db: Db,
  mesaId: string,
  excluirPedidoId: string
): Promise<boolean> {
  const abiertos = await db.pedido.count({
    where: {
      mesaId,
      id: { not: excluirPedidoId },
      estado: { notIn: CERRADOS },
    },
  });
  return abiertos === 0;
}
