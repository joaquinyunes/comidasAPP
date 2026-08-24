// ============================================================
// Texto que ve el cliente según el estado de su pedido.
// Módulo puro.
// ============================================================

import type { EstadoPedido } from "./estados";

const MENSAJES: Record<EstadoPedido, string> = {
  recibido: "Recibimos tu pedido. En breve arranca la cocina.",
  en_preparacion: "Lo estamos preparando.",
  listo: "¡Listo! El mozo te lo lleva.",
  entregado: "Disfrutá tu comida. Cuando quieras, pedí la cuenta.",
  pagado: "Pago recibido. ¡Gracias por venir!",
  cancelado: "El pedido fue cancelado. Consultá con el personal.",
};

export function mensajeCliente(estado: string): string {
  return MENSAJES[estado as EstadoPedido] ?? "Pedido en curso.";
}

export const SIN_APURAR =
  "Todo va bien, no hace falta apurar. Te avisamos cuando esté listo.";
