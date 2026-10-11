// Cuánto lleva esperando una comanda y qué tan grave es.
// Los umbrales están en un solo lugar para que el color de la tarjeta,
// el contador del encabezado y las alertas del jefe hablen igual.

export const MIN_ATENCION = 10;
export const MIN_CRITICA = 15;

export type NivelDemora = "normal" | "atencion" | "critica";

export function minutosDesde(iso: string, ahora: number = Date.now()): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((ahora - t) / 60000));
}

export function nivelDemora(minutos: number): NivelDemora {
  if (minutos >= MIN_CRITICA) return "critica";
  if (minutos >= MIN_ATENCION) return "atencion";
  return "normal";
}

interface ConEdad {
  desde: string;
  items: { urgente: boolean }[];
}

// La comanda con algo urgente va primero; después, la más antigua.
export function ordenarComandas<T extends ConEdad>(comandas: T[]): T[] {
  const urgente = (c: T) => (c.items.some((i) => i.urgente) ? 0 : 1);
  return [...comandas].sort(
    (a, b) => urgente(a) - urgente(b) || new Date(a.desde).getTime() - new Date(b.desde).getTime()
  );
}
