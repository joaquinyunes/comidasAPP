"use client";

import { useMemo } from "react";
import { useListaPedidos } from "./useListaPedidos";
import PedidoFila from "./PedidoFila";

// Vista de caja: solo lo que falta cobrar.
export default function PedidosPorCobrar() {
  const { pedidos, cargando, error, recargar } = useListaPedidos();

  const porCobrar = useMemo(
    () => pedidos.filter((p) => ["recibido", "en_preparacion", "listo", "entregado"].includes(p.estado)),
    [pedidos]
  );

  return (
    <div>
      <h2 className="mb-2 font-semibold">Pedidos por cobrar ({porCobrar.length})</h2>
      {error && <p className="mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando && pedidos.length === 0 && <p className="text-sm text-zinc-500">Cargando…</p>}
      {!cargando && porCobrar.length === 0 && (
        <p className="text-sm text-zinc-500">No hay nada pendiente de cobro.</p>
      )}
      <div className="space-y-2">
        {porCobrar.map((p) => (
          <PedidoFila key={p.id} pedido={p} onCambio={recargar} />
        ))}
      </div>
    </div>
  );
}
