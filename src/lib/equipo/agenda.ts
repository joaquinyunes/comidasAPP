// Turnos del equipo: lectura de fechas/horas que vienen del backend y
// agrupación por día para armar la agenda.

// "1970-01-01T09:00:00.000Z" -> "09:00"
export function horaDe(iso: string): string {
  return iso.length >= 16 ? iso.slice(11, 16) : iso;
}

// "2026-10-12T00:00:00.000Z" -> "2026-10-12"
export function diaDe(iso: string): string {
  return iso.slice(0, 10);
}

export interface TurnoBase {
  fecha: string;
  horaInicio: string;
}

export interface GrupoDia<T> {
  dia: string;
  turnos: T[];
}

// Agenda desde `desde` (YYYY-MM-DD) en adelante, ordenada por día y hora.
export function agruparPorDia<T extends TurnoBase>(turnos: T[], desde: string): GrupoDia<T>[] {
  const porDia = new Map<string, T[]>();
  for (const t of turnos) {
    const dia = diaDe(t.fecha);
    if (dia < desde) continue;
    porDia.set(dia, [...(porDia.get(dia) ?? []), t]);
  }
  return [...porDia.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dia, lista]) => ({
      dia,
      turnos: [...lista].sort((a, b) => horaDe(a.horaInicio).localeCompare(horaDe(b.horaInicio))),
    }));
}

// Horas entre dos "HH:MM" (cruza medianoche si el fin es menor).
export function horasDeTurno(inicio: string, fin: string): number {
  const aMin = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + (mm || 0);
  };
  let d = aMin(fin) - aMin(inicio);
  if (d < 0) d += 24 * 60;
  return Math.round((d / 60) * 10) / 10;
}
