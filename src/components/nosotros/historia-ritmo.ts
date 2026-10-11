// Ritmo de la historia atada al scroll. La timeline mide en "capítulos":
// una intro corta y después un tramo de 1 por capítulo. Puro y testeable.

export const INTRO = 0.6;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function duracion(total: number): number {
  return INTRO + Math.max(0, total);
}

export function inicioCapitulo(indice: number): number {
  return INTRO + indice;
}

// Rangos (en unidades de timeline) de las tres fases de un capítulo.
// La última lámina/texto no sale: se queda hasta que termina el sticky.
export function fases(indice: number, total: number) {
  const s = inicioCapitulo(indice);
  const ultimo = indice === total - 1;
  return {
    laminaEntra: { desde: s - 0.2, hasta: s + 0.35 },
    textoEntra: { desde: s, hasta: s + 0.3 },
    sale: ultimo ? null : { desde: s + 0.8, hasta: s + 1.1 },
  };
}

// Capítulo "activo" para un progreso 0..1 (null durante la intro).
export function capituloActual(progreso: number, total: number): number | null {
  if (total <= 0) return null;
  const t = clamp01(progreso) * duracion(total);
  const idx = Math.floor(t - INTRO + 0.2);
  if (idx < 0) return null;
  return Math.min(total - 1, idx);
}
