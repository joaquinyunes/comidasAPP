// Geometría del "Viaje por la galaxia": una cámara que avanza por el eje Z y
// pasa junto a un planeta por sector. Funciones puras (sin DOM) para poder
// testearlas solas. Unidades: z en px, x en vw, y en vh.

export const PERSPECTIVA = 900;
export const SEPARACION = 880;

export interface Posicion {
  x: number;
  y: number;
  z: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Los planetas se alternan derecha/izquierda y a distintas alturas, cada uno
// un paso más lejos que el anterior.
export function posicionPlaneta(i: number): Posicion {
  const lado = i % 2 === 0 ? 1 : -1;
  const ritmo = [0.95, 1.2, 0.78][i % 3];
  return { x: lado * 23 * ritmo, y: [-4, 7, -1][i % 3], z: -(i + 1) * SEPARACION };
}

// Los meteoros (platos sueltos) se reparten a lo largo de todo el recorrido,
// intercalados entre los planetas.
export function posicionMeteoro(m: number, total: number, planetas: number): Posicion {
  const largo = (planetas + 0.5) * SEPARACION;
  const lado = m % 2 === 0 ? -1 : 1;
  return {
    x: lado * (28 + ((m * 37) % 17)),
    y: ((m * 53) % 41) - 20,
    z: -((m + 0.5) / Math.max(1, total)) * largo - 120,
  };
}

// Cuánto avanzó el mundo hacia la cámara para un progreso de scroll 0..1.
export function avanceMundo(progreso: number, planetas: number): number {
  return clamp01(progreso) * (planetas + 0.5) * SEPARACION;
}

// Opacidad según la profundidad relativa a la cámara (zc = avance + z del
// objeto): aparece desde la niebla lejana y se desvanece al pasar encima.
export function opacidadPorProfundidad(zc: number): number {
  const lejos = -4.2 * SEPARACION;
  const nitido = -1.6 * SEPARACION;
  if (zc <= lejos) return 0;
  if (zc < nitido) return (zc - lejos) / (nitido - lejos);
  const cerca = 0.2 * PERSPECTIVA;
  const fuera = 0.78 * PERSPECTIVA;
  if (zc <= cerca) return 1;
  if (zc >= fuera) return 0;
  return 1 - (zc - cerca) / (fuera - cerca);
}

// El rótulo flotante del planeta se desvanece cuando el planeta ya está
// encima de la cámara (zc cerca de 0): lo reemplaza el cartel fijo.
export function opacidadRotulo(zc: number): number {
  return clamp01((-zc - 0.4 * SEPARACION) / (0.5 * SEPARACION));
}

// Índice del planeta más cercano al plano de la pantalla.
export function sectorActual(progreso: number, planetas: number): number {
  const idx = Math.round(avanceMundo(progreso, planetas) / SEPARACION) - 1;
  return Math.min(Math.max(0, planetas - 1), Math.max(0, idx));
}
