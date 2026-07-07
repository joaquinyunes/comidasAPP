"use client";

import { KDSCompleto } from "@/components/kds-completo";

export default function BarraPage() {
  const handleItemListo = (pedidoId: string, itemId: string) => {
    console.log("Item listo:", { pedidoId, itemId });
  };

  const handlePedidoListo = (pedidoId: string) => {
    console.log("Pedido listo para entregar:", pedidoId);
  };

  return (
    <KDSCompleto
      tipo="barra"
      sucursalId="demo-sucursal"
      onItemListo={handleItemListo}
      onPedidoListo={handlePedidoListo}
    />
  );
}
