"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    if (menuOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
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
              <a href="#menu" onClick={closeMenu}>
                Carta
              </a>
            </li>
            <li>
              <a href="#stats" onClick={closeMenu}>
                Nosotros
              </a>
            </li>
            <li>
              <a href="#regions" onClick={closeMenu}>
                Sucursales
              </a>
            </li>
            <li>
              <a href="#contact" onClick={closeMenu}>
                Contacto
              </a>
            </li>
          </ul>
        </nav>
      </header>
      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </>
  );
}
