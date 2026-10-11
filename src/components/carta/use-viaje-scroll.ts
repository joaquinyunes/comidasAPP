"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/components/landing/animations/gsap-client";
import {
  SEPARACION,
  avanceMundo,
  opacidadPorProfundidad,
  opacidadRotulo,
  posicionMeteoro,
  posicionPlaneta,
  sectorActual,
} from "./viaje-geometria";

interface UltimoEstado {
  opacidad: number;
  rotulo: number;
  rotacion: number;
}

// Ata el viaje al scroll de la sección alta (mismo patrón que el hero del
// home): una timeline "scrub" de duración 1 → posiciones = progreso. Escribe
// directo en el DOM (transform/opacity del mundo 3D) para no pasar por React
// en cada cuadro; sólo avisa a React cuando cambia el sector. Sólo toca el
// estilo de un objeto si su valor cambió de verdad (los lejanos no gastan).
export function useViajeScroll(
  sectionRef: RefObject<HTMLElement | null>,
  planetas: number,
  meteoros: number,
  onSector: (indice: number | null) => void
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || planetas === 0) return;

      const q = <T extends Element>(sel: string) => gsap.utils.toArray<T>(sel, section);
      const mundo = q<HTMLElement>(".carta-viaje-mundo")[0];
      if (!mundo) return;
      const planetasEl = q<HTMLElement>("[data-planeta]");
      const meteorosEl = q<HTMLElement>("[data-meteoro]");
      const copy = q(".carta-viaje-copy");
      const hint = q(".carta-viaje-hint");
      const riel = q(".carta-viaje-riel-fill");
      const final = q(".carta-viaje-final");
      const caption = q(".carta-viaje-caption");
      const escena = q(".carta-viaje-escena");
      const lejos = q(".carta-viaje-estrellas-lejos");
      const cerca = q(".carta-viaje-estrellas-cerca");

      const estado = { p: 0 };
      let ultimoSector: number | null = -2;
      const ultimos = new Map<HTMLElement, UltimoEstado>();

      const poner = (el: HTMLElement, zc: number, rotacion?: number) => {
        const o = Math.round(opacidadPorProfundidad(zc) * 100) / 100;
        const r = Math.round(opacidadRotulo(zc) * 100) / 100;
        const rot = rotacion === undefined ? 0 : Math.round(rotacion);
        const previo = ultimos.get(el);
        if (previo && previo.opacidad === o && previo.rotulo === r && previo.rotacion === rot) return;
        ultimos.set(el, { opacidad: o, rotulo: r, rotacion: rot });

        // El rótulo se apaga al acercarse: ahí manda el cartel inferior.
        el.style.setProperty("--rotulo", String(r));
        el.style.opacity = String(o);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = o > 0.55 && zc > -SEPARACION * 1.1 ? "auto" : "none";
        if (rotacion !== undefined && el.firstElementChild) {
          (el.firstElementChild as HTMLElement).style.transform = `rotate(${rot}deg)`;
        }
      };

      const pintar = () => {
        try {
          const w = avanceMundo(estado.p, planetas);
          // Leve "alabeo" de la cámara: el recorrido se siente orgánico.
          const alabeo = Math.sin(estado.p * Math.PI * 2) * 3;
          mundo.style.transform = `translate3d(0,0,${w.toFixed(1)}px) rotateZ(${alabeo.toFixed(2)}deg)`;

          planetasEl.forEach((el, i) => poner(el, w + posicionPlaneta(i).z));
          meteorosEl.forEach((el, m) => {
            const dir = m % 2 === 0 ? 1 : -1;
            poner(el, w + posicionMeteoro(m, meteoros, planetas).z, estado.p * 540 * dir);
          });

          const dentro = estado.p > 0.002 && estado.p < 0.998;
          const sector = dentro ? sectorActual(estado.p, planetas) : null;
          if (sector !== ultimoSector) {
            ultimoSector = sector;
            onSector(sector);
          }
        } catch {
          // decorativo: un cuadro fallido no debe romper la carta
        }
      };

      pintar();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 },
      });
      tl.to(estado, { p: 1, duration: 1, onUpdate: pintar }, 0);
      // La portada arranca despejada: los planetas aparecen al empezar a viajar.
      tl.fromTo(escena, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.015);
      // Parallax de las estrellas: las cercanas se escapan más rápido.
      tl.to(lejos, { yPercent: -10, duration: 1 }, 0);
      tl.to(cerca, { yPercent: -22, duration: 1 }, 0);
      // El título "se atraviesa": crece hacia la cámara mientras se desvanece.
      tl.to(copy, { autoAlpha: 0, scale: 1.3, y: -50, duration: 0.12 }, 0);
      tl.to(hint, { autoAlpha: 0, duration: 0.05 }, 0.02);
      tl.fromTo(caption, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.1);
      tl.fromTo(riel, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
      tl.fromTo(
        final,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" },
        0.91
      );
    },
    { scope: sectionRef, dependencies: [planetas, meteoros] }
  );
}
