// Versión compacta para espacios chicos (tarjetas de mesa): "8 min", "1h 05m".
export function duracionCorta(minutos: number): string {
  const m = Math.max(0, Math.floor(minutos));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto === 0 ? `${h}h` : `${h}h ${String(resto).padStart(2, "0")}m`;
}

// Tiempo transcurrido en palabras cortas: "8 min", "1 h 05 min", "10 h".
export function formatoDuracion(minutos: number): string {
  const m = Math.max(0, Math.floor(minutos));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto === 0 ? `${h} h` : `${h} h ${String(resto).padStart(2, "0")} min`;
}
