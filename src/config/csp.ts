// Content-Security-Policy de la app (S2). Un solo lugar para la política y para el interruptor
// reporte/bloqueo. Se elige con la variable de entorno CSP_MODO:
//   (vacía o "reporte")  → solo se registran las violaciones en /api/csp (no se bloquea nada)
//   "bloquear"           → el navegador BLOQUEA lo que incumpla
// Es una variable de BUILD: cambiarla en Vercel y redeplegar (Next fija las cabeceras al compilar); volver atrás es borrarla y redeplegar.
// img-src admite https: porque las fotos de la carta las carga el restaurante con URLs propias.

export type ModoCsp = "reporte" | "bloquear";

export function modoCsp(valor: string | undefined): ModoCsp {
  return valor === "bloquear" ? "bloquear" : "reporte";
}

export function politicaCsp(modo: ModoCsp): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'", // 'unsafe-inline': Next inyecta scripts en línea; pasar a nonces es otro paso (docs/CSP-A-BLOQUEO.md)
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(modo === "reporte" ? ["report-uri /api/csp"] : []),
  ].join("; ");
}

// Cabeceras CSP según el modo. En reporte, solo frame-ancestors se aplica (equivale a
// X-Frame-Options) y la política completa va como Report-Only; en bloqueo, una sola cabecera.
export function cabecerasCsp(modo: ModoCsp): { key: string; value: string }[] {
  if (modo === "bloquear") return [{ key: "Content-Security-Policy", value: politicaCsp("bloquear") }];
  return [
    { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    { key: "Content-Security-Policy-Report-Only", value: politicaCsp("reporte") },
  ];
}
