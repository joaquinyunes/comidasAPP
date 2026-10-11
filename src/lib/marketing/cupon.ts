// Cómo se cuenta un cupón: en palabras del salón y con su estado real.

export interface CuponBase {
  tipo: string;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  usosMaximos: number;
  usosActuales: number;
  activo: boolean;
}

export type EstadoCupon = "vigente" | "pausado" | "vencido" | "agotado" | "proximo";

export function describirDescuento(tipo: string, valor: number): string {
  const n = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(valor);
  if (tipo === "porcentaje") return `${n}% de descuento`;
  if (tipo === "monto_fijo") return `$${n} de descuento`;
  if (tipo === "2x1") return "2x1";
  return `${tipo} ${n}`;
}

export function estadoCupon(c: CuponBase, ahora: number = Date.now()): EstadoCupon {
  if (!c.activo) return "pausado";
  if (c.usosActuales >= c.usosMaximos) return "agotado";
  if (new Date(c.fechaFin).getTime() < ahora) return "vencido";
  if (new Date(c.fechaInicio).getTime() > ahora) return "proximo";
  return "vigente";
}

export function usosRestantes(c: Pick<CuponBase, "usosMaximos" | "usosActuales">): number {
  return Math.max(0, c.usosMaximos - c.usosActuales);
}
