"use client";

import { useEffect, useState } from "react";

export default function PanelSelfService() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch("/api/selfservice/resumen").then((r) => r.json()).then((j) => setD(j.data ?? null));
  }, []);

  if (!d) return <p className="text-sm text-zinc-500">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <T titulo="Categorías" v={d.categorias} />
        <T titulo="Productos" v={d.productos} />
        <T titulo="Roles" v={d.roles} />
        <T titulo="Promociones" v={d.promocionesActivas} />
        <T titulo="Módulos" v={d.modulosActivos} />
      </div>
      <div className={`rounded border p-3 text-sm ${d.listoParaVender ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
        {d.listoParaVender ? "✅ Tu local está configurado para vender (menú, productos y roles listos)." : "⚠️ Falta configurar menú, productos o roles antes de abrir."}
      </div>
    </div>
  );
}

function T({ titulo, v }: { titulo: string; v: number }) {
  return (
    <div className="rounded border border-zinc-200 p-3 text-center">
      <div className="text-2xl font-bold">{v}</div>
      <div className="text-xs text-zinc-500">{titulo}</div>
    </div>
  );
}
