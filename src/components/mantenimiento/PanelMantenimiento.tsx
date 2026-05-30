"use client";

import { useEffect, useState } from "react";

interface Equipo { id: string; nombre: string; tipo: string | null; ubicacion: string | null; proximaIntervencion: string | null; vencido: boolean; ultimaIntervencion: any; temperaturasFueraDeRango: number; ultimasTemperaturas: any[]; }

export default function PanelMantenimiento() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const d = await (await fetch("/api/mantenimiento/equipos")).json();
    setEquipos(d.data ?? []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  async function intervenir(id: string) {
    const tipo = prompt("Tipo de intervención (LIMPIEZA | SERVICE | REPARACION):") ?? "LIMPIEZA";
    await fetch(`/api/mantenimiento/equipos/${id}/intervencion`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo }) });
    cargar();
  }
  async function temperatura(id: string) {
    const t = prompt("Temperatura registrada:") ?? "0";
    await fetch(`/api/mantenimiento/equipos/${id}/temperatura`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ temperatura: Number(t), rangoMin: 0, rangoMax: 5 }) });
    cargar();
  }

  if (cargando) return <p className="text-sm text-zinc-500">Cargando equipos…</p>;

  return (
    <div className="space-y-2">
      {equipos.map((e) => (
        <div key={e.id} className={`rounded border p-3 text-sm ${e.vencido ? "border-red-300 bg-red-50" : "border-zinc-200"}`}>
          <div className="flex items-center justify-between">
            <div><b>{e.nombre}</b> {e.tipo ? `· ${e.tipo}` : ""} {e.ubicacion ? `· ${e.ubicacion}` : ""}</div>
            <div className="flex gap-1">
              <button onClick={() => temperatura(e.id)} className="rounded bg-zinc-100 px-2 py-0.5 text-xs hover:bg-zinc-200">Temp</button>
              <button onClick={() => intervenir(e.id)} className="rounded bg-zinc-100 px-2 py-0.5 text-xs hover:bg-zinc-200">Intervenir</button>
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Próxima intervención: {e.proximaIntervencion ? new Date(e.proximaIntervencion).toLocaleDateString() : "—"} {e.vencido ? "⚠️ vencido" : ""}
            {e.temperaturasFueraDeRango > 0 ? ` · ${e.temperaturasFueraDeRango} temp fuera de rango` : ""}
          </div>
        </div>
      ))}
      {equipos.length === 0 && <p className="text-sm text-zinc-400">Sin equipos registrados.</p>}
    </div>
  );
}
