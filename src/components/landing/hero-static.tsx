"use client";

import { useRef } from "react";
import HeroCopy from "./hero-copy";
import HeroStage from "./hero-stage";
import { useHeroEntrance } from "./animations/use-hero-entrance";

// Hero estático (planeta con mascotas): respaldo para equipos sin WebGL o
// cuando la escena 3D falla en runtime.
export default function HeroStatic() {
  const heroRef = useRef<HTMLElement>(null);
  useHeroEntrance(heroRef);

  return (
    <section className="hero-section" ref={heroRef} id="inicio">
      <HeroCopy />
      <HeroStage />
    </section>
  );
}
