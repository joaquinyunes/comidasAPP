"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { Imagen } from "./Imagen";
import { GALAXY_SLIDES } from "./galaxy-slides";
import { useAutoplay } from "./animations/use-autoplay";
import { usePointerParallax } from "./animations/use-pointer-parallax";
import { useSlideTransition } from "./animations/use-slide-transition";

const TOTAL = GALAXY_SLIDES.length;
const CHISPAS = 8;
const UMBRAL_SWIPE_PX = 48;

// Slider "Elegí tu misión": la bandeja flota por encima de un planeta de
// color, con la palabra gigante detrás y anillos orbitando. Reacciona al
// puntero (parallax), cambia con vuelo + chispas, avanza solo y se puede
// arrastrar en el celular.
export default function GalaxySlider() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const escenaRef = useRef<HTMLDivElement>(null);
  const toqueX = useRef<number | null>(null);

  const ir = useCallback((i: number) => setActivo(((i % TOTAL) + TOTAL) % TOTAL), []);
  const siguiente = useCallback(() => setActivo((a) => (a + 1) % TOTAL), []);
  const anterior = useCallback(() => setActivo((a) => (a - 1 + TOTAL) % TOTAL), []);

  useSlideTransition(escenaRef, activo, TOTAL);
  usePointerParallax(escenaRef);
  useAutoplay(siguiente, pausado, activo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [siguiente, anterior]);

  const alPresionar = (e: PointerEvent) => {
    toqueX.current = e.clientX;
  };
  const alSoltar = (e: PointerEvent) => {
    if (toqueX.current === null) return;
    const dx = e.clientX - toqueX.current;
    toqueX.current = null;
    if (Math.abs(dx) < UMBRAL_SWIPE_PX) return;
    if (dx < 0) siguiente();
    else anterior();
  };

  const slide = GALAXY_SLIDES[activo];

  return (
    <section
      className="galaxy-section"
      id="slider"
      onPointerEnter={() => setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="carousel-head" style={{ textAlign: "center" }}>
        <span
          className="font-body reveal-up"
          style={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--purple)" }}
        >
          Elegí tu misión
        </span>
        <h2 className="font-display reveal-up" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginTop: 12, color: "var(--black)" }}>
          Los <span style={{ color: "var(--red)" }}>clásicos</span>
        </h2>
      </div>

      <div
        ref={escenaRef}
        className="galaxy-escena"
        onPointerDown={alPresionar}
        onPointerUp={alSoltar}
        onPointerCancel={() => (toqueX.current = null)}
        style={{ ["--slide-color" as string]: slide.color }}
      >
        <div className="galaxy-orbita galaxy-orbita-1" aria-hidden="true" data-depth="0.3" />
        <div className="galaxy-orbita galaxy-orbita-2" aria-hidden="true" data-depth="0.5" />

        <div className="galaxy-planeta-par" aria-hidden="true" data-depth="0.2">
          <div className="galaxy-planeta" data-planeta />
        </div>

        {GALAXY_SLIDES.map((s, i) => (
          <figure
            key={s.name}
            data-slide
            className="galaxy-slide"
            aria-hidden={i === activo ? undefined : true}
            aria-label={i === activo ? s.name : undefined}
          >
            <div className="galaxy-palabra-par" data-depth="-0.6">
              <span data-palabra className="galaxy-palabra" aria-hidden="true">
                {s.word}
              </span>
            </div>
            <div className="galaxy-foto-par" data-depth="1">
              <div data-foto className="galaxy-foto">
                <div className="galaxy-flota">
                  <Imagen src={s.img} alt={s.name} className="galaxy-img" priority={i === 0} />
                </div>
              </div>
            </div>
          </figure>
        ))}

        <div className="galaxy-chispas" aria-hidden="true">
          {Array.from({ length: CHISPAS }, (_, i) => (
            <span key={i} data-chispa className="galaxy-chispa">
              ✦
            </span>
          ))}
        </div>
      </div>

      <div className="galaxy-info" aria-live="polite">
        <h3 key={slide.name} className="galaxy-name">
          {slide.name}
        </h3>
        <p key={`${slide.name}-t`} className="galaxy-tagline">
          {slide.tagline}
        </p>
        <Link href="/ordenar" className="pop-btn pop-btn-yellow galaxy-cta">
          Pedir {slide.name}
        </Link>
      </div>

      <div className="galaxy-nav">
        <button className="galaxy-arrow" onClick={anterior} aria-label="Anterior">
          &#8592;
        </button>
        <div className="galaxy-dots">
          {GALAXY_SLIDES.map((s, i) => (
            <button
              key={s.name}
              className={`galaxy-dot ${i === activo ? "active" : ""}`}
              style={{ backgroundColor: i === activo ? s.color : "transparent" }}
              onClick={() => ir(i)}
              aria-label={s.name}
              aria-current={i === activo ? "true" : undefined}
            />
          ))}
        </div>
        <button className="galaxy-arrow" onClick={siguiente} aria-label="Siguiente">
          &#8594;
        </button>
      </div>
    </section>
  );
}
