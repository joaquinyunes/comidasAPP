"use client";

import { useState, useCallback, useEffect } from "react";
import { Imagen } from "./Imagen";

interface Slide {
  name: string;
  img: string;
  ovalColor: string;
}

const slides: Slide[] = [
  { name: "GALAXY BITE", img: "/assets/galaxy-bite.png", ovalColor: "var(--yellow)" },
  { name: "HYPERDOG", img: "/assets/hyperdog.png", ovalColor: "var(--purple)" },
  { name: "PIZZANAUT", img: "/assets/pizzanaut.png", ovalColor: "var(--red)" },
];

export default function GalaxySlider() {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning || idx === active) return;
      setTransitioning(true);
      setTimeout(() => {
        setActive(idx);
        setTimeout(() => setTransitioning(false), 50);
      }, 350);
    },
    [active, transitioning]
  );

  const next = useCallback(() => goTo((active + 1) % slides.length), [active, goTo]);
  const prev = useCallback(() => goTo((active - 1 + slides.length) % slides.length), [active, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[active];

  return (
    <section className="galaxy-section" id="slider">
      <div className="carousel-head" style={{ textAlign: "center" }}>
        <span className="font-body reveal-up" style={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--purple)" }}>
          Elegí tu misión
        </span>
        <h2 className="font-display reveal-up" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginTop: 12, color: "var(--black)" }}>
          Los <span style={{ color: "var(--red)" }}>clásicos</span>
        </h2>
      </div>

      <div className="galaxy-oval" style={{ backgroundColor: slide.ovalColor }} />

      <div className="galaxy-slide">
        <div className={`galaxy-img-wrap ${transitioning ? "entering" : "visible"}`}>
          <Imagen key={slide.img} src={slide.img} alt={slide.name} />
        </div>

        <div className="galaxy-name">{slide.name}</div>

        <div className="galaxy-nav">
          <button className="galaxy-arrow" onClick={prev} aria-label="Anterior">&#8592;</button>
          <div className="galaxy-dots">
            {slides.map((s, i) => (
              <button
                key={s.name}
                className={`galaxy-dot ${i === active ? "active" : ""}`}
                style={{ backgroundColor: i === active ? s.ovalColor : "transparent" }}
                onClick={() => goTo(i)}
                aria-label={s.name}
              />
            ))}
          </div>
          <button className="galaxy-arrow" onClick={next} aria-label="Siguiente">&#8594;</button>
        </div>
      </div>
    </section>
  );
}
