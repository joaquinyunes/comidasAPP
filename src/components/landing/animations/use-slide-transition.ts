"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "./gsap-client";

// Cambio de slide del slider galáctico: la bandeja que sale gira y vuela
// hacia un costado mientras la nueva llega del otro con rebote; la palabra
// gigante cruza en sentido contrario, el planeta "late" y salen chispas.
// Si se cambia en medio de una transición, la anterior termina al instante.
export function useSlideTransition(
  escenaRef: RefObject<HTMLElement | null>,
  activo: number,
  total: number
) {
  const previo = useRef(activo);
  const lineaActual = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const escena = escenaRef.current;
      if (!escena) return;
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", escena);
      if (!slides.length) return;

      lineaActual.current?.progress(1);

      // Montaje (o doble ejecución de StrictMode): sólo fija el estado base.
      if (previo.current === activo) {
        slides.forEach((s, i) => gsap.set(s, { autoAlpha: i === activo ? 1 : 0 }));
        return;
      }

      try {
        const de = slides[previo.current];
        const a = slides[activo];
        if (!de || !a) return;
        const adelante = (activo - previo.current + total) % total <= total / 2;
        const dir = adelante ? 1 : -1;
        previo.current = activo;

        const fotoDe = de.querySelector("[data-foto]");
        const palabraDe = de.querySelector("[data-palabra]");
        const fotoA = a.querySelector("[data-foto]");
        const palabraA = a.querySelector("[data-palabra]");
        const planeta = escena.querySelector("[data-planeta]");
        const chispas = gsap.utils.toArray<HTMLElement>("[data-chispa]", escena);

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        lineaActual.current = tl;

        tl.to(fotoDe, { x: -dir * 380, rotation: -dir * 22, scale: 0.5, autoAlpha: 0, duration: 0.5, ease: "power3.in" }, 0);
        tl.to(palabraDe, { x: dir * 160, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 0);
        tl.set(de, { autoAlpha: 0 }, 0.5);

        tl.set(a, { autoAlpha: 1 }, 0.18);
        tl.fromTo(
          fotoA,
          { x: dir * 380, rotation: dir * 22, scale: 0.5, autoAlpha: 0 },
          { x: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.95, ease: "back.out(1.5)" },
          0.18
        );
        tl.fromTo(
          palabraA,
          { x: -dir * 220, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.85 },
          0.22
        );

        if (planeta) {
          tl.fromTo(planeta, { scale: 0.9 }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.5)" }, 0.15);
        }
        if (chispas.length) {
          tl.fromTo(
            chispas,
            { x: 0, y: 0, scale: 0, autoAlpha: 1 },
            {
              x: (i: number) => Math.cos((i / chispas.length) * Math.PI * 2 + 0.4) * (150 + (i % 3) * 40),
              y: (i: number) => Math.sin((i / chispas.length) * Math.PI * 2 + 0.4) * (110 + (i % 3) * 30),
              scale: (i: number) => 0.8 + (i % 3) * 0.35,
              rotation: (i: number) => (i % 2 ? 180 : -180),
              autoAlpha: 0,
              duration: 0.9,
              stagger: 0.025,
              ease: "power2.out",
            },
            0.2
          );
        }
      } catch {
        // decorativo: ante un fallo, igual mostramos el slide activo
        slides.forEach((s, i) => gsap.set(s, { autoAlpha: i === activo ? 1 : 0 }));
        previo.current = activo;
      }
    },
    { scope: escenaRef, dependencies: [activo, total] }
  );
}
