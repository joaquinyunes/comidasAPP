"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap-client";

// Parallax con el puntero: cada hijo con `data-depth` (positivo = se acerca,
// negativo = se aleja) se desplaza y se inclina suavemente según dónde esté
// el mouse dentro del contenedor, y vuelve al centro al salir. Usa quickTo
// (un solo tween reutilizado) para no crear animaciones por movimiento.
// En táctil no hay hover: no hace nada. Falla aislada: sin parallax todo
// queda quieto y visible.
export function usePointerParallax(
  contenedorRef: RefObject<HTMLElement | null>,
  fuerza = 26
) {
  useGSAP(
    () => {
      const cont = contenedorRef.current;
      if (!cont) return;
      if (typeof window === "undefined" || !window.matchMedia("(hover: hover)").matches) return;
      try {
        const capas = gsap.utils.toArray<HTMLElement>("[data-depth]", cont).map((el) => ({
          depth: parseFloat(el.dataset.depth ?? "0") || 0,
          x: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
          rotY: gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" }),
          rotX: gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" }),
        }));
        if (!capas.length) return;

        const mover = (e: PointerEvent) => {
          const r = cont.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
          capas.forEach((c) => {
            c.x(-nx * c.depth * fuerza);
            c.y(-ny * c.depth * fuerza * 0.7);
            c.rotY(nx * c.depth * 7);
            c.rotX(-ny * c.depth * 5);
          });
        };
        const soltar = () => {
          capas.forEach((c) => {
            c.x(0);
            c.y(0);
            c.rotY(0);
            c.rotX(0);
          });
        };

        cont.addEventListener("pointermove", mover, { passive: true });
        cont.addEventListener("pointerleave", soltar);
        return () => {
          cont.removeEventListener("pointermove", mover);
          cont.removeEventListener("pointerleave", soltar);
        };
      } catch {
        // decorativo
      }
    },
    { scope: contenedorRef, dependencies: [fuerza] }
  );
}
