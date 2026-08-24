// ============================================================
// Máquina de estados de pedidos e ítems.
// Módulo puro: sin IO, sin dependencias. Solo la definición
// canónica de estados y las transiciones permitidas.
// ============================================================

export type EstadoPedido =
  | "recibido"
  | "en_preparacion"
  | "listo"
  | "entregado"
  | "pagado"
  | "cancelado";

export type EstadoItem =
  | "recibido"
  | "en_preparacion"
  | "en_pausa"
  | "listo"
  | "entregado"
  | "anulado";

export const ESTADOS_PEDIDO: readonly EstadoPedido[] = [
  "recibido",
  "en_preparacion",
  "listo",
  "entregado",
  "pagado",
  "cancelado",
];

export const ESTADOS_ITEM: readonly EstadoItem[] = [
  "recibido",
  "en_preparacion",
  "en_pausa",
  "listo",
  "entregado",
  "anulado",
];

// Estados en los que el pedido sigue "vivo" (cuenta abierta).
export const ESTADOS_PEDIDO_ACTIVOS: readonly EstadoPedido[] = [
  "recibido",
  "en_preparacion",
  "listo",
  "entregado",
];

const TRANSICIONES_PEDIDO: Record<EstadoPedido, readonly EstadoPedido[]> = {
  recibido: ["en_preparacion", "cancelado"],
  en_preparacion: ["listo", "cancelado"],
  listo: ["entregado", "cancelado"],
  entregado: ["pagado"],
  pagado: [],
  cancelado: [],
};

const TRANSICIONES_ITEM: Record<EstadoItem, readonly EstadoItem[]> = {
  recibido: ["en_preparacion", "anulado"],
  en_preparacion: ["en_pausa", "listo", "anulado"],
  en_pausa: ["en_preparacion", "anulado"],
  listo: ["entregado", "anulado"],
  entregado: [],
  anulado: [],
};

export function esEstadoPedido(valor: string): valor is EstadoPedido {
  return (ESTADOS_PEDIDO as readonly string[]).includes(valor);
}

export function esEstadoItem(valor: string): valor is EstadoItem {
  return (ESTADOS_ITEM as readonly string[]).includes(valor);
}

export function puedeTransicionarPedido(desde: string, hacia: string): boolean {
  if (!esEstadoPedido(desde) || !esEstadoPedido(hacia)) return false;
  if (desde === hacia) return true;
  return TRANSICIONES_PEDIDO[desde].includes(hacia);
}

export function puedeTransicionarItem(desde: string, hacia: string): boolean {
  if (!esEstadoItem(desde) || !esEstadoItem(hacia)) return false;
  if (desde === hacia) return true;
  return TRANSICIONES_ITEM[desde].includes(hacia);
}
