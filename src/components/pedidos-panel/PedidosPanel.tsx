"use client";

import { useMemo, useState } from "react";
import { useListaPedidos } from "./useListaPedidos";
import PedidoFila from "./PedidoFila";

const GRUPOS: { clave: string; label: string; estados: string[] }[] = [
  { clave: "activos", label: "Activos", estados: ["recibido", "en_preparacion", "listo", "entregado"] },
  { clave: "por_cobrar", label: "Por cobrar", estados: ["entregado", "listo"] },
  { clave: "cerrados", label: "Cerrados", estados: ["pagado", "cancelado"] },
];

export default function PedidosPanel() {
  const { pedidos, cargando, error, recargar } = useListaPedidos();
  const [grupo, setGrupo] = useState("activos");

  const def = GRUPOS.find((g) => g.clave === grupo)!;
  const visibles = useMemo(
    () => pedidos.filter((p) => def.estados.includes(p.estado)),
    [pedidos, def]
  );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <button
          onClick={recargar}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {GRUPOS.map((g) => {
          const n = pedidos.filter((p) => g.estados.includes(p.estado)).length;
          return (
            <button
              key={g.clave}
              onClick={() => setGrupo(g.clave)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                grupo === g.clave ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {g.label} ({n})
            </button>
          );
        })}
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando && pedidos.length === 0 && <p className="text-sm text-zinc-500">Cargando…</p>}
      {!cargando && visibles.length === 0 && (
        <p className="text-sm text-zinc-500">No hay pedidos en este grupo.</p>
      )}

      <div className="space-y-2">
        {visibles.map((p) => (
          <PedidoFila key={p.id} pedido={p} onCambio={recargar} />
        ))}
      </div>
    </div>
  );
}
