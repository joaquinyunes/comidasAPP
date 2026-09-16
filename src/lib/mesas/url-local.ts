// URL pública del QR único para "pedir en el local" (salón sin mesa
// asignada por QR individual): el cliente escanea, cae al formulario
// con el código válido, y ahí escribe su mesa o el nombre del mozo.
// Módulo puro.

export function urlPedirLocal(origin: string, codigo: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/pedir-local?codigo=${encodeURIComponent(codigo)}`;
}
