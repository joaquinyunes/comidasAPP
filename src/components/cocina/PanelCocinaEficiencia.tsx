"use client";

import { useEffect, useState } from "react";

interface ItemCocina {
  id: string;
  producto: string;
  mesa: number | null;
  estado: string;
  urgente: boolean;
  pausado: boolean;
  horaEnviado: string | null;
  tiempoPreparacionMin: number | null;
}

export default function PanelCocinaEficiencia() {
  const [estaciones, setEstaciones] = useState<{ estacion: string; items: ItemCocina[] }[]>([]);
  const [tiempos, setTiempos] = useState<{ producto: string; estacion: string | null; promedioMin: number }[]>([]);
  const [carga, setCarga] = useState(true);

  async function cargar() {
    const [e, t] = await Promise.all([fetch("/api/cocina/estaciones"), fetch("/api/cocina/tiempos-coccion")]);
    const ed = await e.json();
    const td = await t.json();
    setEstaciones(ed.data ?? []);
    setTiempos(td.data ?? []);
    setCarga(false);
  }

  useEffect(() => { cargar(); const i = setInterval(cargar, 10000); return () => clearInterval(i); }, []);

  async function toggleUrgente(id: string) {
    await fetch(`/api/cocina/items/${id}/urgente`, { method: "POST" });
    cargar();
  }
  async function togglePausa(id: string) {
    await fetch(`/api/cocina/items/${id}/pausa`, { method: "POST" });
    cargar();
  }

  if (carga) return <p className="text-sm text-zinc-500">Cargando cocina…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Tiempos de cocción (promedio)</h3>
        <div className="overflow-x-auto rounded border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr><th className="p-2 text-left">Producto</th><th className="p-2 text-left">Estación</th><th className="p-2 text-right">Min</th></tr>
            </thead>
            <tbody>
              {tiempos.map((t, i) => (
                <tr key={i} className="border-t border-zinc-100">
                  <td className="p-2">{t.producto}</td>
                  <td className="p-2 text-zinc-500">{t.estacion ?? "—"}</td>
                  <td className="p-2 text-right">{t.promedioMin}</td>
                </tr>
              ))}
              {tiempos.length === 0 && <tr><td colSpan={3} className="p-2 text-zinc-400">Sin datos aún</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Agrupación por estación</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {estaciones.map((e) => (
            <div key={e.estacion} className="rounded border border-zinc-200 p-3">
              <div className="font-medium mb-2">{e.estacion}</div>
              <ul className="space-y-1 text-sm">
                {e.items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-2">
                    <span className={it.urgente ? "text-red-600 font-semibold" : ""}>
                      {it.urgente ? "🔥 " : ""}{it.producto}
                      {it.mesa ? ` · M${it.mesa}` : ""}
                      {it.pausado ? " · ⏸ pausa" : ""}
                    </span>
                    <span className="flex gap-1 shrink-0">
                      <button onClick={() => toggleUrgente(it.id)} className="rounded bg-zinc-100 px-2 py-0.5 text-xs hover:bg-zinc-200">
                        {it.urgente ? "Quitar urg" : "Urgente"}
                      </button>
                      <button onClick={() => togglePausa(it.id)} className="rounded bg-zinc-100 px-2 py-0.5 text-xs hover:bg-zinc-200">
                        {it.pausado ? "Reanudar" : "Pausar"}
                      </button>
                    </span>
                  </li>
                ))}
                {e.items.length === 0 && <li className="text-zinc-400">Sin pedidos</li>}
              </ul>
            </div>
          ))}
          {estaciones.length === 0 && <p className="text-sm text-zinc-400">Sin actividad en cocina.</p>}
        </div>
      </div>
    </div>
  );
}
