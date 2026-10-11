"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../animations/gsap-client";
import { COPY_EXIT_RANGE, FINALE_RANGE, HERO_CAPTIONS } from "./hero-captions-data";

// Ata el recorrido al scroll de la sección alta:
//  - escribe el progreso (0..1) en `progressRef` para la escena 3D;
//  - orquesta con una timeline "scrub" la entrada/salida de los carteles,
//    la barra de progreso y la pista de scroll.
export function useHeroScroll(
  sectionRef: RefObject<HTMLElement | null>,
  progressRef: RefObject<number>
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const trigger = {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
      };

      ScrollTrigger.create({
        ...trigger,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
        onRefresh: (self) => {
          progressRef.current = self.progress;
        },
      });

      const q = <T extends Element>(sel: string) => gsap.utils.toArray<T>(sel, section);
      const copy = q(".hero3d-copy");
      const hint = q(".hero3d-hint");
      const rail = q(".hero3d-rail-fill");
      const finale = q("[data-finale]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { ...trigger, scrub: 0.6 },
      });
      // La timeline dura exactamente 1 → posiciones = progreso de scroll.
      tl.set({}, {}, 1);

      tl.to(
        copy,
        {
          autoAlpha: 0,
          y: -70,
          scale: 0.92,
          duration: COPY_EXIT_RANGE.to - COPY_EXIT_RANGE.from,
        },
        COPY_EXIT_RANGE.from
      );
      tl.to(hint, { autoAlpha: 0, duration: 0.05 }, 0.02);
      tl.fromTo(rail, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

      HERO_CAPTIONS.forEach((c) => {
        const el = q(`[data-caption="${c.id}"]`);
        const span = c.to - c.from;
        const slide = c.side === "left" ? -60 : 60;
        tl.fromTo(
          el,
          { autoAlpha: 0, x: slide, scale: 0.88, rotation: c.side === "left" ? -3 : 3 },
          { autoAlpha: 1, x: 0, scale: 1, rotation: 0, duration: span * 0.35, ease: "power2.out" },
          c.from
        ).to(
          el,
          { autoAlpha: 0, x: -slide * 0.5, scale: 1.06, duration: span * 0.3, ease: "power1.in" },
          c.to - span * 0.3
        );
      });

      tl.fromTo(
        finale,
        { autoAlpha: 0, y: 60, scale: 0.85 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: (FINALE_RANGE.to - FINALE_RANGE.from) * 0.5,
          ease: "back.out(1.6)",
        },
        FINALE_RANGE.from
      );
    },
    { scope: sectionRef }
  );
}
