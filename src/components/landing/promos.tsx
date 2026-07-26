"use client";

import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import type { PromoLanding, ReseñaLanding } from "@/lib/landing-data";

// ============================================================
// PROMOS y RESEÑAS — diseño mejorado.
// ============================================================
export function Promos({ promos }: { promos: PromoLanding[] }) {
  if (!promos.length) return null;
  return (
    <section id="promos" className="relative z-10 px-6 sm:px-10 py-20 font-body scroll-mt-28">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title="PROMOS" accent="DE LA SEMANA" subtitle="Aprovechá estas ofertas 🔥" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {promos.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 80} direction="scale">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#ff3b6b]/15 to-[#ffd23f]/10 border border-[#ff3b6b]/30 rounded-2xl p-6 card-hover h-full group">
                {/* Glow effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff3b6b]/10 rounded-full blur-2xl group-hover:bg-[#ff3b6b]/20 transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[2px] font-bold bg-[#ff3b6b] text-white px-3 py-1 rounded-full">
                      {p.tipo}
                    </span>
                    <span className="text-xl">🏷️</span>
                  </div>
                  <h3 className="font-display text-xl mt-2 leading-tight">{p.nombre}</h3>
                  {p.descripcion && (
                    <p className="text-sm opacity-60 mt-2 leading-relaxed">{p.descripcion}</p>
                  )}
                </div>
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
    <section id="reseñas" className="relative z-10 px-6 sm:px-10 py-20 font-body">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title="LO QUE DICEN" accent="DE NOSOTROS" subtitle="💬 Opiniones de quienes ya probaron" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reseñas.map((r, idx) => (
            <Reveal key={r.id} delay={idx * 80} direction="up">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 card-hover h-full hover:border-white/20 transition-colors">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-[#ffd23f] text-base">★</span>
                  ))}
                </div>
                <p className="font-script text-xl text-[#ffd23f] leading-snug">
                  &ldquo;{r.motivo || "¡Riquísimo!"}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff3b6b]/30 to-[#ffd23f]/30 flex items-center justify-center text-xs font-bold">
                    {r.cliente.charAt(0)}
                  </div>
                  <p className="text-xs opacity-50">{r.cliente}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
