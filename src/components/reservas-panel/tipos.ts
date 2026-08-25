// Forma de una reserva tal como la devuelve GET /api/reservas.

export interface ReservaApi {
  id: string;
  estado: string;
  fecha: string;
  hora: string;
  cantidadPersonas: number;
  zona: string | null;
  notas: string | null;
  nombreCliente: string | null;
  telefono: string | null;
  email: string | null;
  mesa: { id: string; numero: string } | null;
  cliente: { nombre: string; telefono: string | null } | null;
}

// Nombre y teléfono para mostrar, venga de donde venga.
export function contacto(r: ReservaApi): { nombre: string; telefono: string | null } {
  return {
    nombre: r.cliente?.nombre ?? r.nombreCliente ?? "Sin nombre",
    telefono: r.cliente?.telefono ?? r.telefono ?? null,
  };
}
