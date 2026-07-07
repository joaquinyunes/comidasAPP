export function setupWebSocket() {
  // WebSocket se configura en el servidor
  // Este archivo exporta utilidades para el cliente
  console.log("🔌 WebSocket setup");
}

// Eventos del sistema
export const EVENTS = {
  MESA_ESTADO_CAMBIADO: "mesa:estado_cambiado",
  PEDIDO_NUEVO: "pedido:nuevo",
  PEDIDO_ITEM_LISTO: "pedido:item_listo",
  PEDIDO_ESTADO_CAMBIADO: "pedido:estado_cambiado",
  STOCK_CRITICO: "stock:critico",
} as const;
