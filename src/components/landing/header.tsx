"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <Link href="/" className="logo-mark">
        JUST <span>PIZZA</span>
      </Link>
      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>
      <nav>
        <ul className={menuOpen ? "open" : ""}>
          <li>
            <a href="#menu" onClick={() => setMenuOpen(false)}>
              Carta
            </a>
          </li>
          <li>
            <a href="#stats" onClick={() => setMenuOpen(false)}>
              Nosotros
            </a>
          </li>
          <li>
            <a href="#regions" onClick={() => setMenuOpen(false)}>
              Sucursales
            </a>
          </li>
          <li>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contacto
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
