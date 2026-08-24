// ============================================================
// Lectura de stock: ¿alcanza el inventario para este pedido?
// Aislado: si el local no cargó recetas o stock, NO bloquea
// (se considera "sin control de inventario").
// ============================================================

import type { Prisma } from "@/generated/prisma/client";
import { calcularRequerimientos, type LineaPedido } from "./stock-requerimientos";

export interface Faltante {
  ingredienteId: string;
  nombre: string;
  requerido: number;
  disponible: number;
}

export interface ResultadoStock {
  controlado: boolean; // el local realmente lleva inventario de estos productos
  ok: boolean;
  faltantes: Faltante[];
}

const SIN_CONTROL: ResultadoStock = { controlado: false, ok: true, faltantes: [] };

export async function evaluarStock(
  db: Prisma.TransactionClient,
  args: { tenantId: string; sucursalId: string; lineas: LineaPedido[] }
): Promise<ResultadoStock> {
  const { tenantId, sucursalId, lineas } = args;
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

  if (recetas.length === 0) return SIN_CONTROL;

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
  if (requerimientos.length === 0) return SIN_CONTROL;

  const stock = await db.stockPorSucursal.findMany({
    where: { sucursalId, ingredienteId: { in: requerimientos.map((r) => r.ingredienteId) } },
    select: { ingredienteId: true, cantidadActual: true, cantidadReservada: true },
  });

  if (stock.length === 0) return SIN_CONTROL;

  const disponiblePorIngr = new Map<string, number>();
  for (const s of stock) {
    const libre = Math.max(0, Number(s.cantidadActual) - Number(s.cantidadReservada));
    disponiblePorIngr.set(s.ingredienteId, (disponiblePorIngr.get(s.ingredienteId) ?? 0) + libre);
  }

  const faltantes: Faltante[] = [];
  for (const req of requerimientos) {
    // Ingrediente sin fila de stock => ese ingrediente no se controla, se ignora.
    if (!disponiblePorIngr.has(req.ingredienteId)) continue;
    const disponible = disponiblePorIngr.get(req.ingredienteId) ?? 0;
    if (disponible + 1e-6 < req.cantidad) {
      faltantes.push({
        ingredienteId: req.ingredienteId,
        nombre: req.nombre,
        requerido: req.cantidad,
        disponible,
      });
    }
  }

  return { controlado: true, ok: faltantes.length === 0, faltantes };
}
