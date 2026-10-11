"use client";

import { useRef } from "react";
import HeroCopy from "./hero-copy";
import HeroStage from "./hero-stage";
import { useHeroEntrance } from "./animations/use-hero-entrance";

// Hero estático (planeta con mascotas): es la versión de respaldo para
// quien pide menos movimiento o no tiene WebGL. Si el equipo soporta 3D se
// ofrece activarlo con un botón.
export default function HeroStatic({ onEnable3d }: { onEnable3d?: () => void }) {
  const heroRef = useRef<HTMLElement>(null);
  useHeroEntrance(heroRef);

  return (
    <section className="hero-section" ref={heroRef} id="inicio">
      <HeroCopy />
      <HeroStage />
      {onEnable3d && (
        <button type="button" className="pop-btn pop-btn-purple hero-enable-3d" onClick={onEnable3d}>
          ✦ Activar viaje 3D
        </button>
      )}
    </section>
  );
}
