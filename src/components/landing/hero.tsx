"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Imagen } from "./Imagen";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const floatingEls = hero.querySelectorAll<HTMLElement>(".parallax-target");
    let raf: number;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;

        floatingEls.forEach((el, i) => {
          const depth = (i + 1) * 12;
          el.style.transform = `translate(${dx * depth}px, ${dy * depth}px) rotate(${dx * 2}deg)`;
        });
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero-section" ref={heroRef} id="inicio">
      <div className="hero-left">
        <div className="hero-illustration parallax-target float-anim">
          <Imagen src="/assets/hyperdog.png" alt="Hyperdog, hot dog cósmico de Cozizina" priority />
        </div>
        <div>
          <div className="hero-title sticker-text reveal-up">ANTOJOS</div>
          <div className="hero-title sticker-text-yellow reveal-up" style={{ animationDelay: "0.1s" }}>
            DE OTRO
          </div>
          <div className="hero-title sticker-text reveal-up" style={{ animationDelay: "0.2s" }}>
            PLANETA
          </div>
        </div>
        <p className="hero-desc reveal-up">
          Pizzas, empanadas y hamburguesas con ingredientes frescos y sabores
          que explotan en tu paladar. Comida al estilo cósmico en Buenos Aires.
        </p>
        <div className="hero-cta reveal-up">
          <Link href="/menu" className="pop-btn pop-btn-red">
            Ver la carta
          </Link>
          <Link href="/ordenar" className="pop-btn pop-btn-yellow">
            Ordenar ahora
          </Link>
        </div>
        <div className="hero-dots reveal-up" aria-hidden="true">
          <div className="hero-dot" style={{ background: "var(--yellow)" }} />
          <div className="hero-dot active" style={{ background: "var(--purple)" }} />
          <div className="hero-dot" style={{ background: "var(--red)" }} />
          <div className="hero-dot" style={{ background: "var(--orange)" }} />
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-main-img parallax-target float-anim-delay-1">
          <Imagen src="/assets/galaxy-bite.png" alt="Galaxy Bite, hamburguesa cósmica de Cozizina" priority />
        </div>
      </div>
    </section>
  );
}
