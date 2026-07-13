"use client";

import { useEffect, useState } from "react";

export default function PanelReportes() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/reportes/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando reportes…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-zinc-200 p-3">
          <div className="text-xs text-zinc-500">Pedidos (30d)</div>
          <div className="text-2xl font-bold">{d.totalPedidos}</div>
        </div>
        <div className="rounded border border-zinc-200 p-3">
          <div className="text-xs text-zinc-500">Facturado (30d)</div>
          <div className="text-2xl font-bold">${d.totalFacturado}</div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Comparación por sucursal</h3>
        <div className="overflow-x-auto rounded border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50"><tr><th className="p-2 text-left">Sucursal</th><th className="p-2 text-right">Pedidos</th><th className="p-2 text-right">Facturado</th></tr></thead>
            <tbody>
              {d.comparacion.map((c: any) => (
                <tr key={c.sucursalId} className="border-t border-zinc-100">
                  <td className="p-2">{c.nombre}</td>
                  <td className="p-2 text-right">{c.pedidos}</td>
                  <td className="p-2 text-right">${c.facturado}</td>
                </tr>
              ))}
              {d.comparacion.length === 0 && <tr><td colSpan={3} className="p-2 text-zinc-400">Sin ventas en el período.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
