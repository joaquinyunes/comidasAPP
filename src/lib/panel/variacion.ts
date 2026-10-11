// Cuánto cambió un valor respecto de otro, en porcentaje entero.
// null cuando no hay base de comparación (evita "+∞%").
export function variacionPorcentual(actual: number, anterior: number): number | null {
  if (!Number.isFinite(actual) || !Number.isFinite(anterior)) return null;
  if (anterior <= 0) return null;
  return Math.round(((actual - anterior) / anterior) * 100);
}

export function textoVariacion(pct: number | null, contra = "ayer"): string {
  if (pct === null) return `Sin datos de ${contra}`;
  if (pct === 0) return `Igual que ${contra}`;
  return `${pct > 0 ? "+" : ""}${pct}% vs ${contra}`;
}
