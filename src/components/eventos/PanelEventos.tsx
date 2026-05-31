"use client";

import { useEffect, useState } from "react";

interface Evento { id: string; estado: string; horaProgramada: string | null; cliente: string; cubiertos: number; pendientesCocina: number; }

export default function PanelEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const d = await (await fetch("/api/eventos")).json();
    setEventos(d.data ?? []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  if (cargando) return <p className="text-sm text-zinc-500">Cargando eventos…</p>;

  return (
    <div className="space-y-2">
      {eventos.map((e) => (
        <div key={e.id} className="flex items-center justify-between rounded border border-zinc-200 p-3 text-sm">
          <div>
            <b>{e.cliente}</b>
            <div className="text-xs text-zinc-500">
              {e.horaProgramada ? new Date(e.horaProgramada).toLocaleString() : "sin hora"} · {e.cubiertos} cubiertos · {e.pendientesCocina} pendientes
            </div>
          </div>
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs">{e.estado}</span>
        </div>
      ))}
      {eventos.length === 0 && <p className="text-sm text-zinc-400">Sin eventos programados.</p>}
    </div>
  );
}
