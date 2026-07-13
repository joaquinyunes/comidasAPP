"use client";

import { useEffect, useState } from "react";

export default function PanelControlDueno() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dueno/control-operativo").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando control operativo…</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Tarjeta titulo="Platos devueltos (30d)" valor={d.platosDevueltos} detalle={Object.entries(d.porMotivo).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"} />
      <Tarjeta titulo="Tiempo promedio servicio" valor={`${d.tiempoPromedioServicioMin} min`} />
      <Tarjeta titulo="Mermas / quiebres" valor={d.mermas} />
      <Tarjeta titulo="Mesas desatendidas" valor={d.mesasDesatendidas.length} detalle={d.mesasDesatendidas.map((m: number) => `M${m}`).join(", ") || "ninguna"} />
      <div className="rounded border border-zinc-200 p-3">
        <div className="font-medium mb-2">Rendimiento de mozos</div>
        <ul className="text-sm space-y-1">
          {d.rendimiento.map((r: any, i: number) => (
            <li key={i} className="flex justify-between"><span>{r.mozo}</span><span className="text-zinc-500">{r.pedidos} pedidos</span></li>
          ))}
          {d.rendimiento.length === 0 && <li className="text-zinc-400">Sin datos</li>}
        </ul>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor, detalle }: { titulo: string; valor: string | number; detalle?: string }) {
  return (
    <div className="rounded border border-zinc-200 p-3">
      <div className="text-xs text-zinc-500">{titulo}</div>
      <div className="text-2xl font-bold">{valor}</div>
      {detalle && <div className="text-xs text-zinc-400 mt-1">{detalle}</div>}
    </div>
  );
}
