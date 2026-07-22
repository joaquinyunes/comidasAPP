"use client";

import { useState } from "react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import type { MesaLanding } from "@/lib/landing-data";

// ============================================================
// MESAS EN VIVO — estado de la sala.
// ============================================================
const ESTADO_COLOR: Record<string, string> = {
  libre: "#3f8a4d", en_cocina: "#e0a94f", comiendo: "#ff3b6b",
  esperando_cuenta: "#ffd23f", reservada: "#7c5cff", limpieza: "#888",
};
const FILTROS = ["todas", "libre", "comiendo", "en_cocina", "reservada", "esperando_cuenta"];

export function Mesas({ mesas }: { mesas: MesaLanding[] }) {
  const [filtro, setFiltro] = useState("todas");
  if (!mesas.length) return null;
  const visibles = filtro === "todas" ? mesas : mesas.filter((m) => m.estado === filtro);

  return (
    <section id="mesas" className="relative z-10 px-6 sm:px-10 py-16 font-body scroll-mt-28">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title="MESAS" accent="EN VIVO" subtitle="Estado de la sala en tiempo real" />
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-colors ${filtro === f ? "bg-[#ff3b6b] text-white" : "bg-white/5 border border-white/10"}`}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {visibles.map((m, idx) => (
            <Reveal key={m.id} delay={idx * 40}>
              <div className="card-hover bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center h-full">
                <div className="text-3xl mb-1">🪑</div>
                <div className="font-bold">Mesa {m.numero}</div>
                <div className="text-xs opacity-60 mb-2">{m.sector} · {m.capacidad} pers.</div>
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: ESTADO_COLOR[m.estado] || "#888", color: "#141212" }}>
                  {m.estado.replace("_", " ")}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
