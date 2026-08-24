// ============================================================
// Evita crear el mismo pedido dos veces (doble toque, reintento
// de red). Se apoya en PedidoEvento; no requiere columna nueva.
// ============================================================

import type { Prisma } from "@/generated/prisma/client";

const VENTANA_MS = 15 * 60 * 1000;
export const EVENTO_CREADO = "PEDIDO_CREADO";

// Si ya existe un pedido creado con esta misma clave en la ventana
// reciente, devuelve su id. Si no, null.
export async function pedidoExistentePorClave(
  db: Prisma.TransactionClient,
  args: { tenantId: string; clave: string }
): Promise<string | null> {
  if (!args.clave) return null;
  const desde = new Date(Date.now() - VENTANA_MS);

  const evento = await db.pedidoEvento.findFirst({
    where: {
      tenantId: args.tenantId,
      evento: EVENTO_CREADO,
      createdAt: { gte: desde },
      metadata: { path: ["idempotencyKey"], equals: args.clave },
    },
    orderBy: { createdAt: "desc" },
    select: { pedidoId: true },
  });

  return evento?.pedidoId ?? null;
}
