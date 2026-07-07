"use client";

import { KDSCompleto } from "@/components/kds-completo";

export default function CocinaPage() {
  const handleItemListo = (pedidoId: string, itemId: string) => {
    console.log("Item listo:", { pedidoId, itemId });
    // TODO: Enviar vía WebSocket + actualizar stock
  };

  const handlePedidoListo = (pedidoId: string) => {
    console.log("Pedido listo para entregar:", pedidoId);
    // TODO: Notificar al mozo vía WebSocket
  };

  return (
    <KDSCompleto
      tipo="cocina"
      sucursalId="demo-sucursal"
      onItemListo={handleItemListo}
      onPedidoListo={handlePedidoListo}
    />
  );
}
