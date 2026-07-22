"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE, NAV_LINKS } from "@/config/site";

// ============================================================
// HEADER — fijo, transparente arriba y sólido al hacer scroll.
// ============================================================
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 font-body ${
        scrolled
          ? "bg-[#141212]/95 backdrop-blur-md border-b border-white/10 py-3"
          : "bg-gradient-to-b from-black/60 to-transparent py-5"
      }`}
    >
      <div className="px-6 sm:px-10 flex items-center justify-between">
        {/* Logo */}
        <div className="font-display text-lg sm:text-xl text-[#ff3b6b] shrink-0" style={{ textShadow: "0 0 12px rgba(255,59,107,.5)" }}>
          {SITE.brand.split(" ").map((w, i) => (i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-[#f4ecd8]">{w}</span>))}
        </div>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="opacity-85 hover:text-[#ffd23f] hover:opacity-100 transition-colors cursor-pointer">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="hidden sm:inline text-xs uppercase tracking-widest opacity-85 hover:text-[#ffd23f] transition-colors">
            Staff
          </Link>
          <a href="#reservas" className="bg-[#ff3b6b] text-white px-4 sm:px-5 py-2 rounded-full text-[11px] font-bold shadow-lg shadow-[#ff3b6b]/30 glow-pulse whitespace-nowrap">
            Reservar
          </a>
          {/* Burger mobile */}
          <button className="md:hidden text-2xl" onClick={() => setOpen((o) => !o)} aria-label="Menú">☰</button>
        </div>
      </div>

      {/* Nav mobile */}
      {open && (
        <nav className="md:hidden flex flex-col gap-1 px-6 pt-3 pb-2 bg-[#141212]/95 backdrop-blur-md border-t border-white/10 text-sm">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 opacity-85 hover:text-[#ffd23f] transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="py-2 opacity-85 hover:text-[#ffd23f] transition-colors">Staff</Link>
        </nav>
      )}
    </header>
  );
}
