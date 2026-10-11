import type { Tono } from "./tonos";

// Cómo se nombra y se pinta cada estado en el panel.
// Los nombres están escritos como los diría un mozo, no como el sistema.

interface Visual {
  etiqueta: string;
  tono: Tono;
}

export const ESTADO_MESA: Record<string, Visual> = {
  libre: { etiqueta: "Libre", tono: "ok" },
  reservada: { etiqueta: "Reservada", tono: "info" },
  esperando_pedido: { etiqueta: "Falta tomar pedido", tono: "aviso" },
  ocupada: { etiqueta: "Ocupada", tono: "neutro" },
  en_cocina: { etiqueta: "En cocina", tono: "neutro" },
  comiendo: { etiqueta: "Comiendo", tono: "neutro" },
  esperando_cuenta: { etiqueta: "Pide la cuenta", tono: "peligro" },
  cuenta_solicitada: { etiqueta: "Pide la cuenta", tono: "peligro" },
  limpieza: { etiqueta: "Limpiar", tono: "aviso" },
};

export const ESTADO_PEDIDO: Record<string, Visual> = {
  recibido: { etiqueta: "Recibido", tono: "neutro" },
  confirmado: { etiqueta: "Confirmado", tono: "neutro" },
  en_preparacion: { etiqueta: "En cocina", tono: "aviso" },
  en_pausa: { etiqueta: "En pausa", tono: "aviso" },
  listo: { etiqueta: "Listo para llevar", tono: "info" },
  entregado: { etiqueta: "Entregado", tono: "neutro" },
  pagado: { etiqueta: "Pagado", tono: "ok" },
  cancelado: { etiqueta: "Cancelado", tono: "peligro" },
  anulado: { etiqueta: "Anulado", tono: "peligro" },
};

const POR_DEFECTO: Visual = { etiqueta: "—", tono: "neutro" };

export function visualMesa(estado: string): Visual {
  return ESTADO_MESA[estado] ?? { ...POR_DEFECTO, etiqueta: estado.replace(/_/g, " ") };
}

export function visualPedido(estado: string): Visual {
  return ESTADO_PEDIDO[estado] ?? { ...POR_DEFECTO, etiqueta: estado.replace(/_/g, " ") };
}
