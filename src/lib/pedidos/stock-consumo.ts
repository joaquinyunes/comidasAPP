// ============================================================
// Escritura de stock: descuenta el inventario que consumió un
// pedido y deja el movimiento registrado.
// Se llama SIEMPRE dentro de una transacción.
// ============================================================

import type { Prisma } from "@/generated/prisma/client";
import { calcularRequerimientos, type LineaPedido } from "./stock-requerimientos";

interface Args {
  tenantId: string;
  sucursalId: string;
  pedidoId: string;
  lineas: LineaPedido[];
}

// Descuenta de las filas de stock (FIFO por vencimiento) y crea un
// StockMovimiento por ingrediente. Ingredientes sin receta o sin stock
// se ignoran sin error.
export async function descontarStock(db: Prisma.TransactionClient, args: Args): Promise<void> {
  const { tenantId, sucursalId, pedidoId, lineas } = args;
  const productoIds = [...new Set(lineas.map((l) => l.productoId))];

  const recetas = await db.receta.findMany({
    where: { tenantId, productoId: { in: productoIds } },
    select: {
      productoId: true,
      recetaIngredientes: {
        select: {
          ingredienteId: true,
          cantidad: true,
          opcional: true,
          ingrediente: { select: { nombre: true } },
        },
      },
    },
  });
  if (recetas.length === 0) return;

  const requerimientos = calcularRequerimientos(
    recetas.map((r) => ({
      productoId: r.productoId,
      recetaIngredientes: r.recetaIngredientes.map((ri) => ({
        ingredienteId: ri.ingredienteId,
        cantidad: Number(ri.cantidad),
        opcional: ri.opcional,
        ingrediente: ri.ingrediente,
      })),
    })),
    lineas
  );

  for (const req of requerimientos) {
    const filas = await db.stockPorSucursal.findMany({
      where: { sucursalId, ingredienteId: req.ingredienteId },
      orderBy: [{ fechaVencimiento: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      select: { id: true, cantidadActual: true },
    });
    if (filas.length === 0) continue;

    let restante = req.cantidad;
    for (const fila of filas) {
      if (restante <= 0) break;
      const enFila = Number(fila.cantidadActual);
      const usar = Math.min(enFila, restante);
      await db.stockPorSucursal.update({
        where: { id: fila.id },
        data: { cantidadActual: { decrement: usar } },
      });
      restante -= usar;
    }

    await db.stockMovimiento.create({
      data: {
        tenantId,
        sucursalId,
        ingredienteId: req.ingredienteId,
        tipo: "consumo",
        cantidad: req.cantidad,
        motivo: "Consumo por pedido",
        origen: "pedido_cliente",
        pedidoId,
      },
    });
  }
}
