"use client";

import { useTablero } from "./useTablero";
import ComandaCard from "./ComandaCard";

export default function TableroCocina() {
  const { comandas, cargando, error, recargar } = useTablero();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cocina</h1>
          <p className="text-sm text-zinc-500">
            {comandas.length} comanda(s) activa(s) · se actualiza sola
          </p>
        </div>
        <button
          onClick={recargar}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Actualizar
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando && comandas.length === 0 && <p className="text-sm text-zinc-500">Cargando…</p>}
      {!cargando && comandas.length === 0 && (
        <p className="text-sm text-zinc-500">No hay comandas en preparación.</p>
      )}

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {comandas.map((c) => (
          <ComandaCard key={c.pedidoId} comanda={c} onCambio={recargar} />
        ))}
      </div>
    </div>
  );
}
