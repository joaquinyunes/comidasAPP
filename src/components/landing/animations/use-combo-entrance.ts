"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap-client";

const PRECIO_ANTES = 12900;
const PRECIO_AHORA = 9900;
const formato = new Intl.NumberFormat("es-AR");

const DESDE: Record<string, { x: number; y: number; rotation: number }> = {
  arriba: { x: 0, y: -280, rotation: 25 },
  der: { x: 280, y: 60, rotation: 40 },
  izq: { x: -280, y: 60, rotation: -40 },
};

// Entrada del banner del combo (una sola vez, al verse): las tres piezas
// llegan volando y se "arman", la insignia de descuento gira hasta su lugar
// y el precio baja contando desde el valor anterior hasta el de la promo.
// Se dispara con IntersectionObserver (no con posiciones de ScrollTrigger):
// la altura del home cambia al hidratar y al cargar datos, y un trigger con
// posiciones viejas nunca saltaba. Siempre activa (pedido explícito del
// dueño: efectos sin depender del "movimiento reducido" del navegador).
export function useComboEntrance(bannerRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const banner = bannerRef.current;
      if (!banner || typeof IntersectionObserver === "undefined") return;

      let io: IntersectionObserver | null = null;
      try {
        const piezas = gsap.utils.toArray<HTMLElement>("[data-pieza]", banner);
        const insignia = banner.querySelector<HTMLElement>("[data-insignia-texto]");
        const estallido = banner.querySelector<HTMLElement>("[data-insignia]");
        const precio = banner.querySelector<HTMLElement>("[data-precio-nuevo]");
        const copia = gsap.utils.toArray<HTMLElement>("[data-copia]", banner);

        gsap.set(piezas, { autoAlpha: 0 });
        if (insignia) gsap.set(insignia, { autoAlpha: 0, scale: 0, rotation: -200 });
        if (estallido) gsap.set(estallido, { scale: 0.2, autoAlpha: 0 });
        gsap.set(copia, { autoAlpha: 0, y: 30 });

        const correr = () => {
          const tl = gsap.timeline();
          tl.to(copia, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0);
          if (estallido) {
            tl.to(estallido, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "back.out(1.6)" }, 0.05);
          }
          piezas.forEach((el, i) => {
            const d = DESDE[el.dataset.desde ?? "arriba"] ?? DESDE.arriba;
            tl.fromTo(
              el,
              { ...d, scale: 0.4, autoAlpha: 0 },
              { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1.1, ease: "back.out(1.4)" },
              0.15 + i * 0.14
            );
          });
          if (insignia) {
            tl.to(insignia, { autoAlpha: 1, scale: 1, rotation: -10, duration: 0.9, ease: "back.out(2)" }, 0.9);
          }
          if (precio) {
            const valor = { v: PRECIO_ANTES };
            tl.to(
              valor,
              {
                v: PRECIO_AHORA,
                duration: 1.3,
                ease: "power2.inOut",
                onUpdate: () => {
                  precio.textContent = `$${formato.format(Math.round(valor.v / 10) * 10)}`;
                },
                onComplete: () => {
                  precio.textContent = `$${formato.format(PRECIO_AHORA)}`;
                },
              },
              0.5
            );
            tl.fromTo(precio, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.5)" }, 1.8);
          }
        };

        io = new IntersectionObserver(
          ([e]) => {
            if (!e?.isIntersecting) return;
            io?.disconnect();
            try {
              correr();
            } catch {
              gsap.set([...piezas, ...copia, insignia, estallido].filter(Boolean), { clearProps: "all" });
            }
          },
          { threshold: 0.2 }
        );
        io.observe(banner);
      } catch {
        // decorativo: sin la entrada, el banner queda completo en su lugar
      }

      return () => io?.disconnect();
    },
    { scope: bannerRef }
  );
}
