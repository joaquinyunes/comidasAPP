// ============================================================
// Máquina de estados de reservas. Módulo puro.
// ============================================================

export const ESTADOS_RESERVA = [
  "pendiente",
  "confirmada",
  "sentada",
  "cancelada",
  "no_show",
] as const;

export type EstadoReserva = (typeof ESTADOS_RESERVA)[number];

const TRANSICIONES: Record<EstadoReserva, readonly EstadoReserva[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["sentada", "cancelada", "no_show"],
  sentada: ["cancelada"],
  cancelada: [],
  no_show: [],
};

export function esEstadoReserva(valor: string): valor is EstadoReserva {
  return (ESTADOS_RESERVA as readonly string[]).includes(valor);
}

export function puedeTransicionarReserva(desde: string, hacia: string): boolean {
  if (!esEstadoReserva(desde) || !esEstadoReserva(hacia)) return false;
  if (desde === hacia) return true;
  return TRANSICIONES[desde].includes(hacia);
}

export const ETIQUETA_ESTADO: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  sentada: "En mesa",
  cancelada: "Cancelada",
  no_show: "No se presentó",
};
