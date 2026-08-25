"use client";

import { useMemo, useState } from "react";
import { ESTADOS_RESERVA, ETIQUETA_ESTADO } from "@/lib/reservas/estados";
import { useReservas } from "./useReservas";
import ReservaFila from "./ReservaFila";

const hoyISO = () => new Date().toISOString().slice(0, 10);

export default function ReservasPanel() {
  const [fecha, setFecha] = useState(hoyISO());
  const [estado, setEstado] = useState<string>("");
  const { reservas, cargando, error, recargar } = useReservas({ fecha });

  const resumen = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of reservas) c[r.estado] = (c[r.estado] ?? 0) + 1;
    return c;
  }, [reservas]);

  const visibles = estado ? reservas.filter((r) => r.estado === estado) : reservas;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Reservas</h1>
      <p className="mb-4 text-sm text-zinc-500">Confirmá, sentá o cancelá las reservas del día.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
        />
        <button
          onClick={() => setFecha(hoyISO())}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Hoy
        </button>
        <button
          onClick={recargar}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FiltroEstado activo={estado === ""} onClick={() => setEstado("")} label={`Todas (${reservas.length})`} />
        {ESTADOS_RESERVA.map((e) => (
          <FiltroEstado
            key={e}
            activo={estado === e}
            onClick={() => setEstado(e)}
            label={`${ETIQUETA_ESTADO[e]} (${resumen[e] ?? 0})`}
          />
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando && <p className="text-sm text-zinc-500">Cargando…</p>}
      {!cargando && !error && visibles.length === 0 && (
        <p className="text-sm text-zinc-500">No hay reservas para mostrar.</p>
      )}

      <div className="space-y-2">
        {visibles.map((r) => (
          <ReservaFila key={r.id} reserva={r} onCambio={recargar} />
        ))}
      </div>
    </div>
  );
}

function FiltroEstado({ activo, onClick, label }: { activo: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        activo ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
