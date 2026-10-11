"use client";

import { useCallback, useRef, useState } from "react";
import HeroCopy from "../hero-copy";
import HeroCaptions from "./hero-captions";
import { useHeroIntro } from "./use-hero-intro";
import { useHeroScene } from "./use-hero-scene";
import { useHeroScroll } from "./use-hero-scroll";

// Hero cinematográfico: una sección alta con un escenario "sticky". Mientras
// se scrollea, la cámara 3D viaja por el espacio pasando por los productos.
export default function Hero3D({ onFail }: { onFail: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);

  const onReady = useCallback(() => setReady(true), []);

  useHeroScroll(sectionRef, progressRef);
  useHeroIntro(sectionRef);
  useHeroScene(hostRef, { progressRef, onReady, onFail });

  return (
    <section className="hero3d" ref={sectionRef} id="inicio">
      <div className="hero3d-sticky">
        <div className="hero3d-bg" aria-hidden="true" />
        <div
          ref={hostRef}
          className={`hero3d-canvas ${ready ? "is-ready" : ""}`}
          aria-hidden="true"
        />

        <div className="hero3d-copy-wrap">
          <div className="hero3d-copy">
            <HeroCopy />
          </div>
        </div>

        <HeroCaptions />

        <div className="hero3d-hint">
          <span className="hero3d-hint-mouse" aria-hidden="true" />
          <span className="hero3d-hint-mouse-text">Scrolleá para viajar</span>
          <span className="hero3d-hint-touch-text">Deslizá para viajar</span>
          <a href="#menu" className="hero3d-skip">
            Ir directo a la carta
          </a>
        </div>

        <div className="hero3d-rail" aria-hidden="true">
          <span className="hero3d-rail-fill" />
        </div>
      </div>
    </section>
  );
}
