"use client";

import { SITE, NAV_LINKS } from "@/config/site";
import type { LandingData } from "@/lib/landing-data";

// ============================================================
// FOOTER — diseño mejorado con hover effects y mejor estructura.
// ============================================================
export function Footer({ sucursal }: { sucursal: LandingData["sucursal"] }) {
  const c = SITE.contacto;
  return (
    <footer className="relative z-10 mt-16 font-body">
      {/* Gradiente de separación */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#ff3b6b]/30 to-transparent" />

      <div className="bg-black/70 backdrop-blur-sm">
        <div className="px-6 sm:px-10 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div>
            <div className="font-display text-2xl text-[#ff3b6b] mb-3" style={{ textShadow: "0 0 12px rgba(255,59,107,.5)" }}>
              {SITE.brand.split(" ").map((w, i) => (i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-[#f4ecd8]">{w}</span>))}
            </div>
            <p className="opacity-60 text-sm leading-relaxed">{SITE.businessName}</p>
            <p className="opacity-40 text-xs mt-3 leading-relaxed">{c.direccion}</p>

            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {SITE.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-base hover:bg-[#ff3b6b]/20 hover:border-[#ff3b6b]/30 hover:scale-110 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-[#ffd23f] text-[10px] uppercase tracking-[3px] mb-5 font-semibold">Navegación</h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="opacity-60 hover:text-[#ff3b6b] hover:opacity-100 hover:pl-1 transition-all duration-200 cursor-pointer">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/login" className="opacity-60 hover:text-[#ff3b6b] hover:opacity-100 hover:pl-1 transition-all duration-200">
                  Acceso staff
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="text-[#ffd23f] text-[10px] uppercase tracking-[3px] mb-5 font-semibold">Horarios</h4>
            <ul className="space-y-2.5 text-sm">
              {c.horarios.map((h) => (
                <li key={h.dia} className="flex justify-between gap-4">
                  <span className="opacity-50">{h.dia}</span>
                  <span className="opacity-80 font-medium">{h.hora}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-[#ffd23f] text-[10px] uppercase tracking-[3px] mb-5 font-semibold">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${c.telefono.replace(/\s/g, "")}`} className="flex items-center gap-2 opacity-60 hover:text-[#ff3b6b] hover:opacity-100 transition-all">
                  <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs">📞</span>
                  {c.telefono}
                </a>
              </li>
              <li>
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 opacity-60 hover:text-[#ff3b6b] hover:opacity-100 transition-all">
                  <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs">✉️</span>
                  {c.email}
                </a>
              </li>
              {sucursal?.telefono && sucursal.telefono !== c.telefono && (
                <li className="flex items-center gap-2 opacity-60">
                  <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs">📍</span>
                  {sucursal.direccion}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Base */}
        <div className="border-t border-white/[0.06] px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-40">
          <p>© {new Date().getFullYear()} {SITE.businessName}. Todos los derechos reservados.</p>
          <p>Hecho con 🍕 y {SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
