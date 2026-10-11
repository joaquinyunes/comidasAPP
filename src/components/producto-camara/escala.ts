// Matemática de escala real. Funciones puras, sin DOM.

// Tarjeta de crédito / DNI (ISO 7810 ID-1): referencia que todos tienen.
export const TARJETA_CM = { ancho: 8.56, alto: 5.4 } as const;

const FOV_HORIZONTAL_GRADOS = 65;
const DISTANCIA_INICIAL_CM = 38;

// Estimación inicial de píxeles por centímetro: cámara trasera típica
// (~65° de campo horizontal) sostenida a ~38 cm de la mesa.
export function pxPorCmInicial(anchoPantallaPx: number): number {
  const fov = (FOV_HORIZONTAL_GRADOS * Math.PI) / 180;
  const anchoVisibleCm = 2 * DISTANCIA_INICIAL_CM * Math.tan(fov / 2);
  return anchoPantallaPx / anchoVisibleCm;
}

// Límites razonables: de ~12 cm a ~120 cm visibles a lo ancho.
export function limitarPxPorCm(valor: number, anchoPantallaPx: number): number {
  const min = anchoPantallaPx / 120;
  const max = anchoPantallaPx / 12;
  return Math.min(max, Math.max(min, valor));
}

export function cmAPx(cm: number, pxPorCm: number): number {
  return cm * pxPorCm;
}

// Centímetros visibles a lo ancho de la pantalla (para mostrarlo al usuario).
export function anchoVisibleCm(anchoPantallaPx: number, pxPorCm: number): number {
  return anchoPantallaPx / pxPorCm;
}
