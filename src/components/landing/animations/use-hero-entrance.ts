"use client";

import type { RefObject } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap-client";

// Timeline de entrada del hero + flotación de las mascotas + parallax de
// mouse. Vive en su propio hook para no mezclar la coreografía del hero con
// el reveal genérico de scroll del resto de la página.
export function useHeroEntrance(heroRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      const pick = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, hero);
      const eyebrow = pick(".hero-eyebrow");
      const titles = pick(".hero-title");
      const desc = pick(".hero-desc");
      const ctas = pick(".hero-cta > *");
      const planet = pick(".hero-planet");
      const orbit = pick(".hero-orbit");
      const pics = pick(".hero-pic");
      const seal = pick(".hero-seal");
      const sparks = pick(".hero-spark");

      if (prefersReducedMotion()) {
        gsap.set(
          [...eyebrow, ...titles, ...desc, ...ctas, ...planet, ...orbit, ...pics, ...seal, ...sparks],
          { clearProps: "all" }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(planet, { scale: 0, rotation: -40, duration: 1, ease: "back.out(1.4)" }, 0)
        .from(orbit, { autoAlpha: 0, scale: 0.6, duration: 0.7 }, 0.35)
        .from(eyebrow, { autoAlpha: 0, y: -16, duration: 0.5 }, 0.1)
        .from(
          titles,
          { autoAlpha: 0, y: 60, scale: 0.7, rotation: -6, duration: 0.75, ease: "back.out(2)", stagger: 0.12 },
          0.2
        )
        .from(desc, { autoAlpha: 0, y: 24, duration: 0.6 }, "-=0.35")
        .from(
          ctas,
          { autoAlpha: 0, y: 20, scale: 0.85, duration: 0.5, ease: "back.out(2.5)", stagger: 0.08 },
          "-=0.3"
        )
        .from(
          pics,
          {
            autoAlpha: 0,
            scale: 0.5,
            rotation: (i: number) => (i === 0 ? 14 : -16),
            duration: 1,
            ease: "elastic.out(1, 0.6)",
            stagger: 0.18,
          },
          0.45
        )
        .from(seal, { scale: 0, rotation: -90, duration: 0.7, ease: "back.out(2.5)" }, 1)
        .from(sparks, { scale: 0, rotation: 120, duration: 0.5, ease: "back.out(3)", stagger: 0.1 }, 1.1);

      // Parallax de mouse con quickTo (reutiliza el mismo tween en vez de
      // crear uno nuevo por frame). Sólo toca "x" y "rotation": el eje "y"
      // queda para la flotación de abajo, así no se pisan.
      const setters = pics.map((el, i) => ({
        xTo: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" }),
        rotTo: gsap.quickTo(el, "rotation", { duration: 0.7, ease: "power3" }),
        depth: (i + 1) * 16,
      }));

      // La flotación y el parallax arrancan recién cuando termina la entrada:
      // evita pelear por "y" / "rotation" con el timeline inicial.
      let entranceDone = false;
      tl.eventCallback("onComplete", () => {
        entranceDone = true;
        pics.forEach((el, i) => {
          gsap.to(el, {
            y: i === 0 ? -12 : 10,
            duration: 3.2 + i * 0.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
      });

      const onMove = (e: MouseEvent) => {
        if (!entranceDone) return;
        const rect = hero.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        setters.forEach((s) => {
          s.xTo(dx * s.depth);
          s.rotTo(dx * 2.5);
        });
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMove);
    },
    { scope: heroRef }
  );
}
