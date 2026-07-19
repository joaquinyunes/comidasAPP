"use client";

import { Reveal } from "./reveal";
import { SITE } from "@/config/site";

// ============================================================
// Título de sección reutilizable (estilo neón).
// ============================================================
export function SectionHeading({ title, accent, subtitle, id }: { title: string; accent: string; subtitle: string; id?: string }) {
  return (
    <Reveal>
      <h2 id={id} className="font-display text-3xl sm:text-4xl text-center mb-2">
        {title} <span className="text-[#ff3b6b]">{accent}</span>
      </h2>
      <p className="text-center opacity-60 mb-8 text-sm font-body">{subtitle}</p>
    </Reveal>
  );
}

// ============================================================
// Loader temático (porción de pizza girando).
// ============================================================
export function Loader({ label = "cargando…" }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#141212] text-[#f4ecd8] font-body gap-5">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#f4ecd8]/30 loader-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-4xl">🍕</span>
      </div>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#ff3b6b] loader-dot" style={{ animationDelay: "0s" }} />
        <span className="w-2 h-2 rounded-full bg-[#ff3b6b] loader-dot" style={{ animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full bg-[#ff3b6b] loader-dot" style={{ animationDelay: "0.4s" }} />
      </div>
      <p className="text-xs opacity-50 tracking-widest uppercase">{label}</p>
    </div>
  );
}
