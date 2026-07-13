"use client";

import { useEffect, useState } from "react";

export default function PanelWhiteLabel() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/whitelabel/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  async function clonar() {
    const origen = prompt("ID del tenant de origen para clonar su rubro (menú):") ?? "";
    if (!origen) return;
    const res = await fetch("/api/whitelabel/clonar-rubro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origenTenantId: origen }) });
    const j = await res.json();
    alert(j.data ? `Clonado: ${j.data.categorias} categorías, ${j.data.productos} productos` : j.error);
  }

  if (!d) return <p className="text-sm text-zinc-500">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded border border-zinc-200 p-3">
        <h3 className="font-medium mb-1">Marca actual</h3>
        <p className="text-sm">{d.tenant?.nombre} <span className="text-zinc-400">({d.tenant?.subdominio})</span></p>
        <p className="text-xs text-zinc-500">Tenants en la plataforma: {d.totalTenants}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500 self-center">Idiomas:</span>
        {d.idiomas.map((i: string) => <span key={i} className="rounded border border-zinc-200 px-2 py-0.5 text-xs">{i}</span>)}
        <span className="text-xs text-zinc-500 self-center ml-2">Monedas:</span>
        {d.monedas.map((m: string) => <span key={m} className="rounded border border-zinc-200 px-2 py-0.5 text-xs">{m}</span>)}
      </div>
      <div>
        <h3 className="font-medium mb-1">Widget embebible</h3>
        <pre className="rounded bg-zinc-100 p-2 text-xs overflow-auto">{d.widgetSnippet}</pre>
      </div>
      <button onClick={clonar} className="rounded bg-zinc-900 px-3 py-2 text-white text-sm">Clonar rubro de otro tenant</button>
    </div>
  );
}
