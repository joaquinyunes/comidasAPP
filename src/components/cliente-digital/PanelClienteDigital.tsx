"use client";

import { useEffect, useState } from "react";

export default function PanelClienteDigital() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/cliente-digital/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">🔔 Alertas de feedback (caritas tristes)</h3>
        <ul className="text-sm space-y-1">
          {d.alertaFeedback.map((a: any) => (
            <li key={a.id} className="text-red-600">{a.motivo ?? "sin motivo"}{a.mesa ? ` · Mesa ${a.mesa}` : ""}</li>
          ))}
          {d.alertaFeedback.length === 0 && <li className="text-zinc-400">Sin alertas</li>}
        </ul>
      </div>
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-2">🍱 Combos inteligentes activos</h3>
        <ul className="text-sm space-y-1">
          {d.combos.map((c: any) => (
            <li key={c.id}><b>{c.nombre}</b>{c.descripcion ? ` — ${c.descripcion}` : ""}</li>
          ))}
          {d.combos.length === 0 && <li className="text-zinc-400">Sin combos activos</li>}
        </ul>
      </div>
      <div className="rounded border border-zinc-200 p-3 text-sm">
        📲 Mesas con QR generado: <b>{d.mesasConQR}</b>
      </div>
    </div>
  );
}
