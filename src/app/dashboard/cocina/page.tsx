"use client";

import { KDS } from "@/components/kds";

export default function CocinaPage() {
  const handleItemListo = (pedidoId: string, itemId: string) => {
    // TODO: Enviar cambio de estado al backend via WebSocket
    console.log("Item listo:", { pedidoId, itemId });
  };

  return (
    <div>
      <KDS tipo="cocina" onItemListo={handleItemListo} />
    </div>
  );
}
