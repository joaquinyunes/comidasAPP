"use client";

import { SITE, NAV_LINKS } from "@/config/site";
import type { LandingData } from "@/lib/landing-data";

// ============================================================
// FOOTER — columnas organizadas: marca, navegación, horarios, contacto, redes.
// ============================================================
export function Footer({ sucursal }: { sucursal: LandingData["sucursal"] }) {
  const c = SITE.contacto;
  return (
    <footer className="relative z-10 mt-10 bg-black/60 border-t border-white/10 font-body">
      <div className="px-6 sm:px-10 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div>
          <div className="font-display text-2xl text-[#ff3b6b] mb-3" style={{ textShadow: "0 0 12px rgba(255,59,107,.5)" }}>
            {SITE.brand.split(" ").map((w, i) => (i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-[#f4ecd8]">{w}</span>))}
          </div>
          <p className="opacity-70 text-sm leading-relaxed">{SITE.businessName}</p>
          <p className="opacity-50 text-xs mt-2 leading-relaxed">{c.direccion}</p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="text-[#ffd23f] text-xs uppercase tracking-widest mb-4">Navegación</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><a href={l.href} className="hover:text-[#ff3b6b] transition-colors cursor-pointer">{l.label}</a></li>
            ))}
            <li><a href="/login" className="hover:text-[#ff3b6b] transition-colors">Acceso staff</a></li>
          </ul>
        </div>

        {/* Horarios */}
        <div>
          <h4 className="text-[#ffd23f] text-xs uppercase tracking-widest mb-4">Horarios</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {c.horarios.map((h) => (
              <li key={h.dia} className="flex justify-between gap-4">
                <span className="opacity-70">{h.dia}</span>
                <span>{h.hora}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-[#ffd23f] text-xs uppercase tracking-widest mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>📞 <a href={`tel:${c.telefono.replace(/\s/g, "")}`} className="hover:text-[#ff3b6b] transition-colors">{c.telefono}</a></li>
            <li>✉️ <a href={`mailto:${c.email}`} className="hover:text-[#ff3b6b] transition-colors">{c.email}</a></li>
            {sucursal?.telefono && sucursal.telefono !== c.telefono && <li>📍 {sucursal.direccion}</li>}
          </ul>
          <div className="flex gap-4 mt-4 text-xl">
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="hover:scale-110 transition-transform hover:text-[#ff3b6b]">{s.icon}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="border-t border-white/10 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-50">
        <p>© {new Date().getFullYear()} {SITE.businessName}. Todos los derechos reservados.</p>
        <p>Hecho con 🍕 y {SITE.tagline}</p>
      </div>
    </footer>
  );
}
