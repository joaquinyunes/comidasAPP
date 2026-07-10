"use client";

import { useEffect, useState } from "react";

export default function PanelGamificacion() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/gamificacion/tablero").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando tablero…</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">🏆 Ranking de mozos</h3>
        <ol className="text-sm space-y-1">
          {d.ranking.map((r: any, i: number) => (
            <li key={i} className="flex justify-between"><span>{i + 1}. {r.mozo}</span><span className="text-zinc-500">{r.pedidos}</span></li>
          ))}
          {d.ranking.length === 0 && <li className="text-zinc-400">Sin datos</li>}
        </ol>
      </div>
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">🎯 Cero errores</h3>
        <ul className="text-sm space-y-1">
          {d.ceroErrores.map((r: any, i: number) => (
            <li key={i} className="flex justify-between"><span>{r.usuario}</span><span className={r.anulaciones === 0 ? "text-green-600" : "text-red-600"}>{r.anulaciones} anul.</span></li>
          ))}
          {d.ceroErrores.length === 0 && <li className="text-zinc-400">Sin datos</li>}
        </ul>
      </div>
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">⏱ Tiempo promedio</h3>
        <div className="text-3xl font-bold">{d.tiempoPromedioMin} min</div>
        <p className="text-xs text-zinc-400 mt-1">cocción envío→listo (30d)</p>
      </div>
    </div>
  );
}
