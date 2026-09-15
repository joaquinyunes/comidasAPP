"use client";

import { useRef } from "react";
import Link from "next/link";
import { Imagen } from "./Imagen";
import { useHeroEntrance } from "./animations/use-hero-entrance";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  useHeroEntrance(heroRef);

  return (
    <section className="hero-section" ref={heroRef} id="inicio">
      <div className="hero-left">
        <div className="hero-illustration parallax-target">
          <Imagen src="/assets/hyperdog.png" alt="Hyperdog, hot dog cósmico de Cozizina" priority />
        </div>
        <div>
          <div className="hero-title sticker-text reveal-up">ANTOJOS</div>
          <div className="hero-title sticker-text-yellow reveal-up">DE OTRO</div>
          <div className="hero-title sticker-text reveal-up">PLANETA</div>
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
        <div className="hero-main-img parallax-target">
          <Imagen src="/assets/galaxy-bite.png" alt="Galaxy Bite, hamburguesa cósmica de Cozizina" priority />
        </div>
      </div>
    </section>
  );
}
