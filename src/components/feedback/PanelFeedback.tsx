"use client";

import { useEffect, useState } from "react";

export default function PanelFeedback() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/feedback/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando feedback…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Tarjeta titulo="Total (30d)" valor={d.total} />
        <Tarjeta titulo="% Feliz" valor={`${d.felizPct}%`} />
        <Tarjeta titulo="Alertas" valor={d.tristes.length} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Caritas tristes recientes</h3>
        <ul className="text-sm space-y-1">
          {d.tristes.map((t: any) => (
            <li key={t.id} className="rounded border border-red-200 bg-red-50 p-2">
              {t.motivo ?? "sin motivo"}{t.mesa ? ` · Mesa ${t.mesa}` : ""} <span className="text-zinc-400">· {new Date(t.fecha).toLocaleString()}</span>
            </li>
          ))}
          {d.tristes.length === 0 && <li className="text-zinc-400">Sin quejas. Todo bien 🎉</li>}
        </ul>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <div className="rounded border border-zinc-200 p-3">
      <div className="text-xs text-zinc-500">{titulo}</div>
      <div className="text-2xl font-bold">{valor}</div>
    </div>
  );
}
