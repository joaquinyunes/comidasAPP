"use client";

import { useLandingData } from "@/lib/landing-data";
import { Leaves } from "./slice";
import { Header } from "./header";
import { Hero } from "./hero";
import { Carta } from "./carta";
import { Mesas } from "./mesas";
import { Promos, Reseñas } from "./promos";
import { Reservas } from "./reservas";
import { Footer } from "./footer";
import { Loader } from "./section-heading";
import { Reveal } from "./reveal";
import { SITE } from "@/config/site";

// ============================================================
// LANDING SHELL — ensambla todas las secciones.
// ============================================================
export function LandingShell() {
  const { data, loading, error } = useLandingData();

  if (loading) return <Loader />;
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141212] text-[#f4ecd8] font-body">
        <p className="opacity-60">No pudimos cargar la carta. Reintentá más tarde.</p>
      </div>
    );
  }

  const direccion = data.sucursal ? `${data.sucursal.direccion} · ☎ ${data.sucursal.telefono}` : null;

  return (
    <main className="relative min-h-screen w-full bg-[#141212] text-[#f4ecd8] overflow-hidden font-body">
      <Header />
      <Leaves />
      <Hero direccion={direccion} />

      <Carta carta={data.carta} />
      <Mesas mesas={data.mesas} />

      {/* CTA banda */}
      <Reveal>
        <section className="relative z-10 px-6 py-16 my-6">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#ff3b6b]/30 bg-gradient-to-br from-[#1c1a1a] to-[#241a1d] px-8 py-12 text-center shadow-2xl shadow-[#ff3b6b]/10">
            <p className="text-xs uppercase tracking-widest text-[#ffd23f] mb-3">{SITE.tagline}</p>
            <h2 className="font-display text-3xl sm:text-5xl mb-4">¿Hambre de <span className="text-[#ff3b6b]">verdad</span>?</h2>
            <p className="opacity-70 max-w-xl mx-auto mb-7">Reservá tu mesa o pedí tu pizza favorita. La tenemos lista en minutos.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#reservas" className="bg-[#ff3b6b] text-white px-7 py-3 rounded-full font-bold shadow-lg shadow-[#ff3b6b]/30 glow-pulse">Reservar mesa</a>
              <a href="#carta" className="border border-white/20 px-7 py-3 rounded-full font-bold hover:border-[#ffd23f] hover:text-[#ffd23f] transition-colors">Ver carta</a>
            </div>
          </div>
        </section>
      </Reveal>

      <Promos promos={data.promociones} />
      <Reseñas reseñas={data.reseñas} />
      <Reservas sucursal={data.sucursal} />
      <Footer sucursal={data.sucursal} />
    </main>
  );
}
