"use client";

import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "./gsap-client";

const UP_SELECTOR = ".reveal-up:not([data-reveal-bound])";
const SCALE_SELECTOR = ".reveal-scale:not([data-reveal-bound])";

function directionX(el: Element): number {
  const dir = (el as HTMLElement).dataset.reveal;
  if (dir === "left") return -70;
  if (dir === "right") return 70;
  return 0;
}

// Engancha los reveals que todavía no tienen disparador y devuelve cuántos
// enganchó (0 = no había nada nuevo).
function bindReveals(): number {
  const ups = gsap.utils.toArray<HTMLElement>(UP_SELECTOR);
  if (ups.length) {
    ups.forEach((el) => el.setAttribute("data-reveal-bound", "1"));
    gsap.set(ups, {
      autoAlpha: 0,
      y: 70,
      x: (_i, el) => directionX(el),
      rotation: (i, el) => (directionX(el) ? 0 : i % 2 === 0 ? -2 : 2),
    });
    ScrollTrigger.batch(ups, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          x: 0,
          rotation: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: { each: 0.08, from: "start" },
          overwrite: true,
        }),
    });
  }

  const scales = gsap.utils.toArray<HTMLElement>(SCALE_SELECTOR);
  if (scales.length) {
    scales.forEach((el) => el.setAttribute("data-reveal-bound", "1"));
    gsap.set(scales, { autoAlpha: 0, scale: 0.82, y: 40, x: (_i, el) => directionX(el) });
    ScrollTrigger.batch(scales, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          x: 0,
          duration: 0.75,
          ease: "back.out(1.6)",
          stagger: { each: 0.08, from: "start" },
          overwrite: true,
        }),
    });
  }
  return ups.length + scales.length;
}

function showAllInstantly() {
  gsap.utils.toArray<HTMLElement>(".reveal-up, .reveal-scale").forEach((el) => {
    el.setAttribute("data-reveal-bound", "1");
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

// Reemplaza el reveal por IntersectionObserver por ScrollTrigger.batch: misma
// promesa (aparece al entrar en viewport) con timing/easing cinemático y sin
// recalcular manualmente umbrales. Falla aislada: si GSAP no puede animar
// algo, el contenido ya está visible en el markup por defecto.
export function useScrollReveal() {
  const { contextSafe } = useGSAP(() => {
    try {
      if (prefersReducedMotion()) {
        showAllInstantly();
        return;
      }
      bindReveals();
    } catch {
      showAllInstantly();
    }
  }, {});

  const rescan = contextSafe(() => {
    if (prefersReducedMotion()) {
      showAllInstantly();
      return;
    }
    try {
      // Sólo se refresca si había elementos nuevos. El rescan lo dispara un
      // MutationObserver y `refresh()` desarma/rearma los pin-spacer (muta el
      // DOM): refrescar siempre generaba un bucle infinito que congelaba la
      // página apenas el pin de ingredientes estaba activo.
      if (bindReveals() > 0) ScrollTrigger.refresh();
    } catch {
      showAllInstantly();
    }
  });

  return rescan;
}
