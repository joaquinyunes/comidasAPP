"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SectionTitle } from "./ui";
import { ImagenThumb } from "./Imagen";
import { gsap, useGSAP, prefersReducedMotion } from "./animations/gsap-client";

const testimonials = [
  {
    name: "Valentina R.",
    role: "Cliente frecuente",
    text: "El Galaxy Bite me hizo flotar. El queso, la carne, todo perfecto. Vuelvo cada semana.",
    stars: 5,
    color: "#F6BE3B",
    avatar: "/assets/testi-avatar-1.png",
  },
  {
    name: "Mateo G.",
    role: "Villa Crespo",
    text: "Los Comet Fries son otro nivel. Mejores que cualquier otra papa frita de la zona.",
    stars: 5,
    color: "#8F57F2",
    avatar: "/assets/testi-avatar-2.png",
  },
  {
    name: "Sofía L.",
    role: "Pedido a domicilio",
    text: "La hamburguesa más rica que probé. Fresca, rápida y con un toque distinto. 100% recomendada.",
    stars: 4,
    color: "#EF4136",
    avatar: "/assets/testi-avatar-3.png",
  },
  {
    name: "Diego M.",
    role: "Palermo",
    text: "Pedí por la web, llegó en minutos y caliente. La atención es de otro planeta.",
    stars: 5,
    color: "#F89B28",
    avatar: "/assets/testi-avatar-4.png",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="testi-stars" aria-label={`${count} estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "testi-star on" : "testi-star"}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(() => {}, { scope: boxRef });

  const swapTo = useCallback(
    (updater: () => void) => {
      contextSafe(() => {
        if (prefersReducedMotion() || !boxRef.current) {
          updater();
          return;
        }
        gsap.to(boxRef.current, {
          autoAlpha: 0,
          y: -14,
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => {
            updater();
            gsap.fromTo(boxRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });
          },
        });
      })();
    },
    [contextSafe]
  );

  const next = useCallback(() => swapTo(() => setActive((a) => (a + 1) % testimonials.length)), [swapTo]);
  const prev = useCallback(() => swapTo(() => setActive((a) => (a - 1 + testimonials.length) % testimonials.length)), [swapTo]);
  const goTo = useCallback((i: number) => swapTo(() => setActive(i)), [swapTo]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="testimonials-section" id="reviews">
      <div className="testimonials-head">
        <SectionTitle
          eyebrow="Testimonios estelares"
          eyebrowColor="var(--purple)"
          titleA="Qué dicen"
          titleB="de nosotros"
          titleBColor="var(--red)"
        />
      </div>

      <div className="testimonials-box pop-card" ref={boxRef}>
        <div className="testi-avatar" style={{ background: t.color }}>
          <ImagenThumb src={t.avatar} alt={t.name} size={72} />
        </div>
        <Stars count={t.stars} />
        <p className="testi-text">{t.text}</p>
        <div className="testi-author">
          <strong className="font-display">{t.name}</strong>
          <span className="testi-role">{t.role}</span>
        </div>
      </div>

      <div className="testimonials-nav">
        <button className="galaxy-arrow" onClick={prev} aria-label="Anterior">&#8592;</button>
        <div className="galaxy-dots">
          {testimonials.map((s, i) => (
            <button
              key={s.name}
              className={`galaxy-dot ${i === active ? "active" : ""}`}
              style={{ backgroundColor: i === active ? s.color : "transparent" }}
              onClick={() => goTo(i)}
              aria-label={s.name}
            />
          ))}
        </div>
        <button className="galaxy-arrow" onClick={next} aria-label="Siguiente">&#8594;</button>
      </div>
    </section>
  );
}