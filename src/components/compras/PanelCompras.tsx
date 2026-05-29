"use client";

import { useEffect, useState } from "react";

export default function PanelCompras() {
  const [sugerencias, setSugerencias] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/compras/sugerencia-automatica").then((r) => r.json()).then((j) => setSugerencias(j.data?.sugerencias ?? []));
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500">Sugerencia automática de compra según quiebres de stock.</p>
      <div className="overflow-x-auto rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50"><tr><th className="p-2 text-left">Insumo</th><th className="p-2 text-right">Actual</th><th className="p-2 text-right">Mín</th><th className="p-2 text-right">Sugerir</th></tr></thead>
          <tbody>
            {sugerencias.map((s) => (
              <tr key={s.ingredienteId} className="border-t border-zinc-100">
                <td className="p-2">{s.nombre}</td>
                <td className="p-2 text-right text-red-600">{s.cantidadActual}</td>
                <td className="p-2 text-right">{s.stockMinimo}</td>
                <td className="p-2 text-right font-semibold">{s.sugeridoComprar} {s.unidad}</td>
              </tr>
            ))}
            {sugerencias.length === 0 && <tr><td colSpan={4} className="p-2 text-zinc-400">Sin quiebres. Todo abastecido.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
