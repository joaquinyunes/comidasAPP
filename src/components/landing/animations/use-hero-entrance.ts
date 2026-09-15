"use client";

import type { RefObject } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap-client";

// Timeline de entrada del hero + parallax de mouse + flotación continua de
// las ilustraciones. Vive en su propio hook para no mezclar la coreografía
// del hero con el reveal genérico de scroll del resto de la página.
export function useHeroEntrance(heroRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      const titles = gsap.utils.toArray<HTMLElement>(".hero-title", hero);
      const illustration = hero.querySelector<HTMLElement>(".hero-illustration");
      const mainImg = hero.querySelector<HTMLElement>(".hero-main-img");
      const desc = hero.querySelector<HTMLElement>(".hero-desc");
      const cta = hero.querySelector<HTMLElement>(".hero-cta");
      const dots = hero.querySelector<HTMLElement>(".hero-dots");

      [...titles, desc, cta, dots].forEach((el) => el?.setAttribute("data-reveal-bound", "1"));

      if (prefersReducedMotion()) {
        gsap.set([...titles, illustration, mainImg, desc, cta, dots].filter(Boolean) as HTMLElement[], {
          clearProps: "all",
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      if (illustration) tl.from(illustration, { autoAlpha: 0, scale: 0.5, rotation: -18, duration: 0.9, ease: "back.out(1.5)" }, 0.1);
      if (titles.length) {
        tl.from(
          titles,
          { autoAlpha: 0, y: 60, scale: 0.7, rotation: -6, duration: 0.75, ease: "back.out(2)", stagger: 0.12 },
          0.2
        );
      }
      if (desc) tl.from(desc, { autoAlpha: 0, y: 24, duration: 0.6 }, "-=0.35");
      if (cta) tl.from(cta.children.length ? Array.from(cta.children) : cta, { autoAlpha: 0, y: 20, scale: 0.85, duration: 0.5, ease: "back.out(2.5)", stagger: 0.08 }, "-=0.3");
      if (dots) tl.from(dots, { autoAlpha: 0, y: 10, duration: 0.4 }, "-=0.2");
      if (mainImg) tl.from(mainImg, { autoAlpha: 0, scale: 0.55, rotation: 14, duration: 1, ease: "elastic.out(1, 0.6)" }, 0.25);

      // Flotación continua propia (reemplaza el float-anim CSS en estos dos
      // elementos para poder combinarla con el parallax sin que se pisen).
      [illustration, mainImg].filter(Boolean).forEach((el, i) => {
        gsap.to(el as HTMLElement, {
          y: i === 0 ? -14 : 12,
          duration: 3.2 + i * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1 + i * 0.3,
        });
      });

      // Parallax de mouse con quickTo (reutiliza el mismo tween en vez de
      // crear uno nuevo por frame). Sólo toca "x" y "rotation": el eje "y"
      // queda reservado a la flotación infinita de arriba para que no se
      // pisen entre sí.
      const targets = gsap.utils.toArray<HTMLElement>(".parallax-target", hero);
      const setters = targets.map((el, i) => {
        const depth = (i + 1) * 16;
        return {
          xTo: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" }),
          rotTo: gsap.quickTo(el, "rotation", { duration: 0.7, ease: "power3" }),
          depth,
        };
      });

      // El parallax no arranca hasta que termina la entrada: evita pelear
      // por la propiedad "rotation" con el timeline inicial.
      let entranceDone = false;
      tl.eventCallback("onComplete", () => {
        entranceDone = true;
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
