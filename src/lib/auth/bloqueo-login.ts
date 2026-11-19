// ============================================================
// Bloqueo temporal tras N intentos fallidos por cuenta (login y código 2FA).
// Los contadores viven en la base (src/lib/limite-intentos.ts), no en memoria: valen igual
// con varias instancias. `prefijo` separa el login ("login") del 2FA del panel ("2fa").
// ============================================================

import { contarIntento, leerIntentos, limpiarIntentos } from "@/lib/limite-intentos";

export const MAX_FALLOS = 5;
export const VENTANA_MS = 15 * 60_000;

const k = (prefijo: string, id: string) => `${prefijo}:${id}`;

// Segundos que faltan para poder reintentar (0 = no está bloqueado).
export async function estaBloqueado(id: string, prefijo = "login"): Promise<number> {
  const { n, espera } = await leerIntentos(k(prefijo, id), VENTANA_MS);
  return n >= MAX_FALLOS ? espera : 0;
}

export async function registrarFallo(id: string, prefijo = "login"): Promise<void> {
  await contarIntento(k(prefijo, id), VENTANA_MS);
}

export async function limpiarFallos(id: string, prefijo = "login"): Promise<void> {
  await limpiarIntentos(k(prefijo, id));
}
