"use client";

import { useEffect, useState } from "react";

interface Asig { id: string; estado: string; empleado: string; zona: string; cliente: string; total: number; horaSalida: string | null; horaEntrega: string | null; }
const ESTADOS = ["asignado", "en_camino", "entregado", "fallido"] as const;

export default function PanelDelivery() {
  const [asignaciones, setAsignaciones] = useState<Asig[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const d = await (await fetch("/api/delivery/seguimiento")).json();
    setAsignaciones(d.data?.asignaciones ?? []);
    setCargando(false);
  }
  useEffect(() => { cargar(); const i = setInterval(cargar, 8000); return () => clearInterval(i); }, []);

  async function avanzar(id: string, estado: string) {
    await fetch(`/api/delivery/${id}/estado`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
    cargar();
  }

  if (cargando) return <p className="text-sm text-zinc-500">Cargando delivery…</p>;

  return (
    <div className="space-y-2">
      {asignaciones.map((a) => (
        <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 p-3 text-sm">
          <div>
            <b>{a.cliente}</b> · {a.empleado} · {a.zona} · ${a.total}
            <div className="text-xs text-zinc-500">
              {a.estado}{a.horaSalida ? ` · salió ${new Date(a.horaSalida).toLocaleTimeString()}` : ""}{a.horaEntrega ? ` · entregó ${new Date(a.horaEntrega).toLocaleTimeString()}` : ""}
            </div>
          </div>
          <select
            value={a.estado}
            onChange={(e) => avanzar(a.id, e.target.value)}
            className="rounded border border-zinc-300 px-2 py-1 text-sm"
          >
            {ESTADOS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      ))}
      {asignaciones.length === 0 && <p className="text-sm text-zinc-400">Sin repartos asignados.</p>}
    </div>
  );
}
