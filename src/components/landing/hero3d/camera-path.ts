// Trayectoria de la cámara en función del progreso de scroll (0..1).
// Función pura: no toca three ni el DOM, así se puede testear sola.

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  lookX: number;
  lookY: number;
  lookZ: number;
  fov: number;
}

export const CAMERA_START_Z = 10;
export const CAMERA_END_Z = -46;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// `spread` (0.45..1) achica el balanceo lateral en pantallas angostas para
// que los productos no se salgan de cuadro.
export function cameraPose(progress: number, spread = 1): CameraPose {
  const p = clamp01(progress);
  // Mezcla de lineal y suavizado: arranca y frena con inercia pero en el
  // medio avanza a velocidad constante.
  const travel = lerp(p, smoothstep(p), 0.4);
  const z = lerp(CAMERA_START_Z, CAMERA_END_Z, travel);

  const sway = Math.sin(p * Math.PI * 3.2) * 1.15 * spread;
  const x = sway;
  const y = Math.cos(p * Math.PI * 2.2) * 0.45;

  return {
    x,
    y,
    z,
    lookX: x * 0.35,
    lookY: y * 0.5,
    lookZ: z - 12,
    // El campo de visión se abre a mitad de viaje: sensación de velocidad.
    fov: 46 + Math.sin(p * Math.PI) * 14,
  };
}
