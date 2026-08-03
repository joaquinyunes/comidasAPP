"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const floats = container.querySelectorAll<HTMLElement>(".float-img");

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;

      floats.forEach((el, i) => {
        const speed = (i + 1) * 18;
        const x = dx * speed;
        const y = dy * speed;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${el.dataset.rotate || "0"}deg)`;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="hero" ref={containerRef}>
      <span className="eyebrow">Est. 2025 &mdash; Ciudad de Mexico</span>

      <div className="echo">
        <span className="echo-back" aria-hidden="true">
          JUST PIZZA
        </span>
        <h1 className="echo-front">JUST PIZZA</h1>
      </div>

      <div className="hero-tags">
        <div className="echo">
          <span className="echo-back" aria-hidden="true">
            Madera
          </span>
          <span className="echo-front">Madera</span>
        </div>
        <div className="echo">
          <span className="echo-back" aria-hidden="true">
            Carbon
          </span>
          <span className="echo-front">Carbon</span>
        </div>
        <div className="echo">
          <span className="echo-back" aria-hidden="true">
            Fuego
          </span>
          <span className="echo-front">Fuego</span>
        </div>
      </div>

      <div className="hero-media">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80"
          alt="Pizza artesanal"
          loading="eager"
        />
        <div className="hero-floats">
          <div
            className="float-img float-1"
            data-rotate="-12"
            style={{ transform: "rotate(-12deg)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
              alt="Pizza flotante 1"
            />
          </div>
          <div
            className="float-img float-2"
            data-rotate="8"
            style={{ transform: "rotate(8deg)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80"
              alt="Pizza flotante 2"
            />
          </div>
        </div>
      </div>

      <div className="hero-copy reveal">
        <div className="label">Sobre nosotros</div>
        <h2>
          Hecha con <span className="font-accent">amor</span> y fuego
        </h2>
        <p>
          Nacimos con la misión de crear la pizza perfecta. Ingredientes frescos
          del dia, masa fermentada 72 horas, y un horno de leña que le da ese
          sabor que no vas a encontrar en ningun otro lugar.
        </p>
        <a href="#menu" className="cta">
          Ver la carta
        </a>
      </div>
    </section>
  );
}
