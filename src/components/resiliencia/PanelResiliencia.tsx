"use client";

import { useEffect, useState } from "react";

export default function PanelResiliencia() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/resiliencia/estado").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando estado…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <T titulo="Pedidos 24h" v={d.pedidos24h} />
        <T titulo="Anulaciones 30d" v={d.anulaciones30d} />
        <T titulo="Mesas ocupadas" v={d.mesasOcupadas} />
        <T titulo="Productos" v={d.productosActivos} />
      </div>
      <div className={`rounded border p-3 text-sm ${d.modoSoloCobro ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"}`}>
        <div className="font-medium">Modo solo-cobro: {d.modoSoloCobro ? "ACTIVO" : "inactivo"}</div>
        <div className="text-zinc-600 mt-1">{d.recomendacion}</div>
        <div className="text-zinc-500 mt-1">Integridad de datos: {d.integridadOk ? "OK" : "revisar"}</div>
      </div>
    </div>
  );
}

function T({ titulo, v }: { titulo: string; v: number }) {
  return (
    <div className="rounded border border-zinc-200 p-3">
      <div className="text-xs text-zinc-500">{titulo}</div>
      <div className="text-2xl font-bold">{v}</div>
    </div>
  );
}
