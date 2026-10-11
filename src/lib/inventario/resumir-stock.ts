// Cuentas del inventario que se muestran arriba de la lista.

export interface LineaStock {
  estado: "ok" | "bajo" | "critico";
  valorTotal: number;
}

export interface ResumenStock {
  total: number;
  criticos: number;
  bajos: number;
  valorTotal: number;
}

export function resumirStock(items: LineaStock[]): ResumenStock {
  return {
    total: items.length,
    criticos: items.filter((i) => i.estado === "critico").length,
    bajos: items.filter((i) => i.estado === "bajo").length,
    valorTotal: items.reduce((s, i) => s + i.valorTotal, 0),
  };
}

// Qué tan lleno está respecto del máximo (o del doble del mínimo si no hay máximo).
export function porcentajeLleno(actual: number, minimo: number, maximo: number): number {
  const tope = maximo > 0 ? maximo : minimo > 0 ? minimo * 2 : 0;
  if (tope <= 0) return actual > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((actual / tope) * 100)));
}

// Días hasta el vencimiento (negativo si ya venció); null si no tiene fecha.
export function diasParaVencer(fechaIso: string | null, ahora: number = Date.now()): number | null {
  if (!fechaIso) return null;
  const t = new Date(fechaIso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((t - ahora) / 86400000);
}
