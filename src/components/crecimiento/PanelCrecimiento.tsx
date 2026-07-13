"use client";

import { useEffect, useState } from "react";

export default function PanelCrecimiento() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/crecimiento/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-zinc-200 p-3">
          <div className="text-xs text-zinc-500">Pedidos (30d)</div>
          <div className="text-2xl font-bold">{d.metricas.pedidos30d}</div>
        </div>
        <div className="rounded border border-zinc-200 p-3">
          <div className="text-xs text-zinc-500">Facturado (30d)</div>
          <div className="text-2xl font-bold">${d.metricas.facturado30d}</div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Módulos activos</h3>
        <div className="flex flex-wrap gap-2">
          {d.modulosActivos.length === 0 && <span className="text-sm text-zinc-400">Ninguno</span>}
          {d.modulosActivos.map((m: string) => <span key={m} className="rounded bg-green-100 px-2 py-0.5 text-xs">{m}</span>)}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Planes de licencia</h3>
        <div className="grid gap-2 md:grid-cols-3">
          {d.planes.map((p: any) => (
            <div key={p.clave} className="rounded border border-zinc-200 p-3">
              <div className="font-medium">{p.nombre}</div>
              <div className="text-sm text-zinc-500">${p.precio}/mes</div>
              <ul className="text-xs text-zinc-500 mt-1">{p.modulos.map((md: string) => <li key={md}>· {md}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
