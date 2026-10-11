"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/landing/animations/gsap-client";

const PENDIENTES = "[data-rev]:not([data-rev-listo])";

function desplazamientoX(el: HTMLElement): number {
  const v = el.dataset.rev;
  if (v === "izq") return -60;
  if (v === "der") return 60;
  return 0;
}

// Entrada por scroll de los bloques marcados con `data-rev`: aparecen una sola
// vez, en lote y escalonados, con movimiento por tiempo (no atado al scroll)
// — el mismo comportamiento que el resto del home, que es lo que se siente
// natural. `clave` re-escanea cuando llegan datos async (la carta).
export function useRevelar(raizRef: RefObject<HTMLElement | null>, clave: unknown) {
  useGSAP(
    () => {
      const raiz = raizRef.current;
      if (!raiz) return;
      let elementos: HTMLElement[] = [];
      try {
        elementos = gsap.utils.toArray<HTMLElement>(PENDIENTES, raiz);
        if (!elementos.length) return;
        elementos.forEach((el) => el.setAttribute("data-rev-listo", "1"));

        gsap.set(elementos, {
          autoAlpha: 0,
          y: 56,
          x: (_i: number, el: HTMLElement) => desplazamientoX(el),
          scale: (_i: number, el: HTMLElement) => (el.dataset.rev === "zoom" ? 0.88 : 1),
        });

        ScrollTrigger.batch(elementos, {
          start: "top 90%",
          once: true,
          onEnter: (lote) =>
            gsap.to(lote, {
              autoAlpha: 1,
              y: 0,
              x: 0,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              stagger: { each: 0.07, from: "start" },
              overwrite: true,
              clearProps: "transform",
            }),
        });

        // La altura cambia al llegar fuentes/imágenes/datos: recalcular los
        // puntos de disparo para que ninguno quede con una posición vieja.
        const refrescar = () => ScrollTrigger.refresh();
        requestAnimationFrame(() => requestAnimationFrame(refrescar));
        document.fonts?.ready.then(refrescar);
        window.addEventListener("load", refrescar, { once: true });
      } catch {
        // decorativo: si GSAP falla, el contenido queda visible en su lugar
        gsap.set(elementos, { clearProps: "all" });
      }
    },
    { scope: raizRef, dependencies: [clave] }
  );
}
