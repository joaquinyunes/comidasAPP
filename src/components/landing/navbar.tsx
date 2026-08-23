"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const LINKS = [
  { label: "Carta", href: "/menu" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Ubicaciones", href: "/ubicaciones" },
  { label: "Ordenar", href: "/ordenar" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <Link href="/" className="nav-logo" aria-label="Cozizina - inicio">
        COZI<span>ZINA</span>
      </Link>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/reservar" className="pop-btn nav-cta">
          Reservar
        </Link>
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}
