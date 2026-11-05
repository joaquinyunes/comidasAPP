// ============================================================
// Bloqueo temporal tras N intentos fallidos de login por cuenta (S3).
// shortcut: contador en memoria del proceso; en Vercel cada instancia lleva el suyo,
// así que el tope real es N x instancias. Cuando haya más de una instancia caliente
// de forma sostenida, pasarlo a Redis/Upstash o a una tabla.
// ============================================================

const MAX_FALLOS = 5;
const VENTANA_MS = 15 * 60_000;

const fallos = new Map<string, { n: number; desde: number }>();

export function estaBloqueado(clave: string, ahora = Date.now()): number {
  const f = fallos.get(clave);
  if (!f) return 0;
  if (ahora - f.desde > VENTANA_MS) {
    fallos.delete(clave);
    return 0;
  }
  return f.n >= MAX_FALLOS ? Math.ceil((f.desde + VENTANA_MS - ahora) / 1000) : 0; // segundos que faltan
}

export function registrarFallo(clave: string, ahora = Date.now()): void {
  const f = fallos.get(clave);
  if (!f || ahora - f.desde > VENTANA_MS) fallos.set(clave, { n: 1, desde: ahora });
  else f.n += 1;
}

export function limpiarFallos(clave: string): void {
  fallos.delete(clave);
}
