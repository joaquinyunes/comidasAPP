"use client";

import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import type { PromoLanding, ReseñaLanding } from "@/lib/landing-data";

// ============================================================
// PROMOS y RESEÑAS.
// ============================================================
export function Promos({ promos }: { promos: PromoLanding[] }) {
  if (!promos.length) return null;
  return (
    <section id="promos" className="relative z-10 px-6 sm:px-10 py-16 font-body scroll-mt-28">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title="PROMOS" accent="DE LA SEMANA" subtitle="Aprovechá estas ofertas 🔥" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {promos.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 60}>
              <div className="glow-pulse bg-gradient-to-br from-[#ff3b6b]/20 to-[#ffd23f]/10 border border-[#ff3b6b]/40 rounded-2xl p-5 card-hover h-full">
                <span className="text-[10px] uppercase tracking-widest bg-[#ff3b6b] text-white px-2 py-0.5 rounded-full">{p.tipo}</span>
                <h3 className="font-display text-xl mt-3">{p.nombre}</h3>
                {p.descripcion && <p className="text-sm opacity-70 mt-1">{p.descripcion}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reseñas({ reseñas }: { reseñas: ReseñaLanding[] }) {
  if (!reseñas.length) return null;
  return (
    <section id="reseñas" className="relative z-10 px-6 sm:px-10 py-16 font-body">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title="LO QUE DICEN" accent="DE NOSOTROS" subtitle="💬 Opiniones de quienes ya probaron" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reseñas.map((r, idx) => (
            <Reveal key={r.id} delay={idx * 60}>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 card-hover h-full">
                <div className="text-[#ffd23f] text-lg mb-2">★★★★★</div>
                <p className="font-script text-xl text-[#ffd23f]">"{r.motivo || "¡Riquísimo!"}"</p>
                <p className="text-xs opacity-60 mt-3">— {r.cliente}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
