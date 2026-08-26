// URL pública que el cliente abre al escanear el QR de su mesa.
// Módulo puro.

export function urlClienteMesa(origin: string, mesaId: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/cliente/${mesaId}`;
}
