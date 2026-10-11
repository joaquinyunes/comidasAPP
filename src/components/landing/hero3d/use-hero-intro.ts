"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "../animations/gsap-client";

// Entrada del texto del hero 3D al cargar la página. Sólo anima los hijos
// del bloque de copy: el bloque en sí lo mueve el scroll (use-hero-scroll).
export function useHeroIntro(sectionRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const pick = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, section);

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(pick(".hero-eyebrow"), { autoAlpha: 0, y: -16, duration: 0.5 }, 0.1)
        .from(
          pick(".hero-title"),
          { autoAlpha: 0, y: 70, scale: 0.7, rotation: -6, duration: 0.8, ease: "back.out(2)", stagger: 0.12 },
          0.2
        )
        .from(pick(".hero-desc"), { autoAlpha: 0, y: 24, duration: 0.6 }, "-=0.35")
        .from(
          pick(".hero-cta > *"),
          { autoAlpha: 0, y: 20, scale: 0.85, duration: 0.5, ease: "back.out(2.5)", stagger: 0.08 },
          "-=0.3"
        );
    },
    { scope: sectionRef }
  );
}
