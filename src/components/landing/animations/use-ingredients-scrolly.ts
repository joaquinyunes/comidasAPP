"use client";

import type { RefObject } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap-client";

// La sección de ingredientes se ancla (pin) mientras cada tarjeta entra en
// secuencia atada al scroll (scrub) — la versión liviana del "scrolljacking"
// de armado de hamburguesa del brief, sin reestructurar el grid a capas
// absolutas. Se desactiva completa con reduced-motion (todo queda visible).
export function useIngredientsScrolly(sectionRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const cards = gsap.utils.toArray<HTMLElement>(".ingredient-card", section);
      if (!cards.length) return;

      cards.forEach((c) => c.setAttribute("data-reveal-bound", "1"));

      if (prefersReducedMotion()) {
        gsap.set(cards, { clearProps: "all" });
        return;
      }

      gsap.set(cards, {
        autoAlpha: 0,
        y: 90,
        scale: 0.72,
        rotation: (i: number) => (i % 2 === 0 ? -9 : 9),
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top+=72",
          end: () => "+=" + Math.round(window.innerHeight * 1.4),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      cards.forEach((card, i) => {
        tl.to(card, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 1, ease: "power2.out" }, i * 0.85);
      });
    },
    { scope: sectionRef }
  );
}
