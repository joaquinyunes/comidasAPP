"use client";

import { useEffect, useState } from "react";

export default function PanelAlcance() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/alcance/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando alcance…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {d.monedas.map((m: any) => (
          <span key={m.codigo} className="rounded border border-zinc-200 px-2 py-1 text-sm">{m.simbolo} {m.codigo}</span>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Productos turísticos destacados</h3>
        <div className="flex flex-wrap gap-2">
          {d.turisticos.map((t: any) => <span key={t.id} className="rounded bg-amber-100 px-2 py-1 text-sm">⭐ {t.nombre}</span>)}
          {d.turisticos.length === 0 && <span className="text-sm text-zinc-400">Ninguno destacado</span>}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Menú multidioma ({d.totalTraducidos} traducidos)</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {d.categorias.map((c: any) => (
            <div key={c.categoria} className="rounded border border-zinc-200 p-3">
              <div className="font-medium mb-1">{c.categoria}</div>
              <ul className="text-sm space-y-0.5">
                {c.items.map((i: any) => (
                  <li key={i.id} className="flex justify-between"><span>{i.nombre}</span><span className="text-zinc-400">{i.traducciones} idiomas</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
