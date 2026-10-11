"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/landing/animations/gsap-client";
import { capituloActual, duracion, fases } from "./historia-ritmo";

// Ata la historia al scroll de la sección alta (patrón del hero del home):
// una timeline scrub cuya duración se mide en capítulos. Cada lámina entra
// desde un costado girando apenas y sale hacia el otro; los textos y el año
// cruzan en sincronía. Sólo transform/opacity (nada de 3D ni filtros) para
// que el scroll se sienta liviano. Sólo avisa a React cuando cambia el
// capítulo.
export function useHistoriaScroll(
  sectionRef: RefObject<HTMLElement | null>,
  total: number,
  onCapitulo: (indice: number | null) => void
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || total === 0) return;
      try {
        const q = <T extends Element>(sel: string) => gsap.utils.toArray<T>(sel, section);
        const intro = q(".historia-intro");
        const hint = q(".historia-hint");
        const riel = q(".historia-riel-fill");
        const laminas = q<HTMLElement>("[data-lamina]");
        const textos = q<HTMLElement>("[data-texto]");
        const anios = q<HTMLElement>("[data-anio]");

        const T = duracion(total);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 },
        });
        tl.set({}, {}, T);

        tl.to(intro, { autoAlpha: 0, y: -70, scale: 1.08, duration: 0.45 }, 0.15);
        tl.to(hint, { autoAlpha: 0, duration: 0.2 }, 0);
        tl.fromTo(riel, { scaleX: 0 }, { scaleX: 1, duration: T }, 0);

        for (let i = 0; i < total; i++) {
          const f = fases(i, total);
          const dir = i % 2 === 0 ? 1 : -1;
          const lamina = laminas[i];
          const texto = textos[i];
          const anio = anios[i];

          if (lamina) {
            tl.fromTo(
              lamina,
              { autoAlpha: 0, x: dir * 160, y: 80, scale: 0.78, rotation: dir * 10 },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotation: dir * -2,
                duration: f.laminaEntra.hasta - f.laminaEntra.desde,
                ease: "power3.out",
              },
              f.laminaEntra.desde
            );
            if (f.sale) {
              tl.to(
                lamina,
                {
                  autoAlpha: 0,
                  x: -dir * 180,
                  y: -40,
                  scale: 1.1,
                  rotation: dir * 8,
                  duration: f.sale.hasta - f.sale.desde,
                  ease: "power2.in",
                },
                f.sale.desde
              );
            }
          }

          [texto, anio].forEach((el, k) => {
            if (!el) return;
            tl.fromTo(
              el,
              { autoAlpha: 0, y: k === 0 ? 60 : 90, scale: k === 0 ? 1 : 0.9 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: f.textoEntra.hasta - f.textoEntra.desde,
                ease: "power3.out",
              },
              f.textoEntra.desde
            );
            if (f.sale) {
              tl.to(
                el,
                {
                  autoAlpha: 0,
                  y: k === 0 ? -50 : -80,
                  duration: f.sale.hasta - f.sale.desde,
                  ease: "power1.in",
                },
                f.sale.desde
              );
            }
          });
        }

        let ultimo: number | null = -2;
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const c = capituloActual(self.progress, total);
            if (c !== ultimo) {
              ultimo = c;
              onCapitulo(c);
            }
          },
        });
      } catch {
        // decorativo: sin la timeline, el contenido queda legible en su lugar
      }
    },
    { scope: sectionRef, dependencies: [total] }
  );
}
