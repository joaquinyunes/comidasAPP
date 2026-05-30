"use client";

import { useEffect, useState } from "react";

export default function PanelTrazabilidad() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/trazabilidad/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando trazabilidad…</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">Anulaciones</h3>
        <ul className="text-sm space-y-1 max-h-72 overflow-auto">
          {d.anulaciones.map((a: any) => (
            <li key={a.id}><b>{a.producto}</b> ×{a.cantidad} — {a.motivo} <span className="text-zinc-400">({a.usuario})</span></li>
          ))}
          {d.anulaciones.length === 0 && <li className="text-zinc-400">Sin anulaciones</li>}
        </ul>
      </div>
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">Eventos</h3>
        <ul className="text-sm space-y-1 max-h-72 overflow-auto">
          {d.eventos.map((e: any) => (
            <li key={e.id}>{e.evento} <span className="text-zinc-400">({e.usuario})</span></li>
          ))}
          {d.eventos.length === 0 && <li className="text-zinc-400">Sin eventos</li>}
        </ul>
      </div>
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">Quién hizo qué</h3>
        <ul className="text-sm space-y-1">
          {Object.entries(d.porUsuario).map(([u, v]: any) => (
            <li key={u} className="flex justify-between"><span>{u}</span><span className="text-zinc-500">A:{v.anulaciones} E:{v.eventos}</span></li>
          ))}
          {Object.keys(d.porUsuario).length === 0 && <li className="text-zinc-400">Sin registros</li>}
        </ul>
      </div>
    </div>
  );
}
