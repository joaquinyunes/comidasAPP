// ============================================================
// Cálculo puro de cuánto de cada ingrediente consume un pedido.
// Sin IO.
// ============================================================

export interface LineaPedido {
  productoId: string;
  cantidad: number;
}

export interface RecetaIngredienteMin {
  ingredienteId: string;
  cantidad: number; // por porción del producto
  opcional: boolean;
  ingrediente: { nombre: string };
}

export interface RecetaMin {
  productoId: string;
  recetaIngredientes: RecetaIngredienteMin[];
}

export interface Requerimiento {
  ingredienteId: string;
  nombre: string;
  cantidad: number;
}

// Las cantidades de ingredientes se guardan con 3 decimales.
function redondear(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

// Suma, por ingrediente, lo que necesitan todas las líneas del pedido.
export function calcularRequerimientos(
  recetas: readonly RecetaMin[],
  lineas: readonly LineaPedido[]
): Requerimiento[] {
  const porProducto = new Map(recetas.map((r) => [r.productoId, r]));
  const acumulado = new Map<string, Requerimiento>();

  for (const linea of lineas) {
    const receta = porProducto.get(linea.productoId);
    if (!receta) continue;
    for (const ri of receta.recetaIngredientes) {
      if (ri.opcional) continue;
      const necesita = ri.cantidad * linea.cantidad;
      const prev = acumulado.get(ri.ingredienteId);
      if (prev) {
        prev.cantidad += necesita;
      } else {
        acumulado.set(ri.ingredienteId, {
          ingredienteId: ri.ingredienteId,
          nombre: ri.ingrediente.nombre,
          cantidad: necesita,
        });
      }
    }
  }

  return [...acumulado.values()].map((r) => ({ ...r, cantidad: redondear(r.cantidad) }));
}
