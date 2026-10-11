"use client";

import { useEffect, useRef } from "react";

const SHAPE_COUNT = 15;

function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) % 233280;
  return Math.abs(x / 233280);
}

// Valores deterministas y redondeados: idénticos en servidor y cliente.
const SHAPES = Array.from({ length: SHAPE_COUNT }, (_, i) => ({
  id: i,
  x: Math.round(seeded(i * 7 + 1) * 1000) / 10,
  y: Math.round(seeded(i * 13 + 3) * 1000) / 10,
  size: Math.round(16 + seeded(i * 17 + 5) * 50),
  color: ["var(--yellow)", "var(--purple-light)", "var(--red)", "var(--orange)", "var(--cream)"][i % 5],
  base: Math.round(seeded(i * 23 + 7) * 600),
}));

export default function FloatingShapes() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        el.querySelectorAll<HTMLElement>(".floating-shape").forEach((s, i) => {
          const speed = 0.02 + (i % 4) * 0.015;
          const base = parseFloat(s.dataset.base || "0");
          const rot = y * (0.03 + (i % 3) * 0.02);
          s.style.transform = `translateY(${base + y * speed}px) rotate(${rot}deg)`;
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="floating-bg" ref={ref} aria-hidden="true">
      {SHAPES.map((s) => (
        <div
          key={s.id}
          className="floating-shape"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: s.color,
          }}
          data-base={s.base}
        />
      ))}
    </div>
  );
}
