// Agrupaciones de ventas por día y por hora, en la zona horaria del local.
// Funciones puras: reciben datos ya leídos y devuelven series completas
// (con ceros donde no hubo ventas) listas para graficar.

export const ZONA_LOCAL = "America/Argentina/Buenos_Aires";

function fechaLocal(fecha: Date, zona: string): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona }).format(fecha);
}

function horaLocal(fecha: Date, zona: string): number {
  const h = new Intl.DateTimeFormat("en-GB", { timeZone: zona, hour: "2-digit", hour12: false }).format(fecha);
  return Number(h) % 24;
}

export interface Cobro {
  monto: number;
  createdAt: Date;
}

export interface VentaDia {
  fecha: string; // YYYY-MM-DD
  total: number;
  cobros: number;
}

export function ventasPorDia(
  cobros: Cobro[],
  dias: number,
  ahora: Date = new Date(),
  zona: string = ZONA_LOCAL
): VentaDia[] {
  const serie = new Map<string, VentaDia>();
  for (let i = dias - 1; i >= 0; i--) {
    const f = fechaLocal(new Date(ahora.getTime() - i * 86400000), zona);
    serie.set(f, { fecha: f, total: 0, cobros: 0 });
  }
  for (const c of cobros) {
    const dia = serie.get(fechaLocal(c.createdAt, zona));
    if (!dia) continue; // fuera de la ventana pedida
    dia.total += c.monto;
    dia.cobros += 1;
  }
  return [...serie.values()].map((d) => ({ ...d, total: Math.round(d.total * 100) / 100 }));
}

// Cuántos pedidos entran en cada hora del día (0–23).
export function pedidosPorHora(fechas: Date[], zona: string = ZONA_LOCAL): number[] {
  const horas = new Array<number>(24).fill(0);
  for (const f of fechas) horas[horaLocal(f, zona)] += 1;
  return horas;
}
