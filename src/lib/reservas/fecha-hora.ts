// Validación REAL de fecha (AAAA-MM-DD) y hora (HH:MM o HH:MM:SS): el regex solo mira la forma, y
// "99:99" o "2026-02-31" terminaban en Invalid Date y un 500.

export function horaValida(h: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(h);
}

export function fechaValida(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d = new Date(`${f}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === f;
}
