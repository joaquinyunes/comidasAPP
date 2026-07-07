"use client";

import { PanelPedidos } from "@/components/panel-pedidos";

export default function PedidosPage() {
  const handleCerrarMesa = (mesaId: string) => {
    console.log("Cerrar mesa:", mesaId);
    // TODO: Abrir modal de cobro
  };

  return <PanelPedidos onCerrarMesa={handleCerrarMesa} />;
}
