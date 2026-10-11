"use client";

import Hero3D from "./hero3d/hero-3d";
import HeroStatic from "./hero-static";
import { useHeroMode } from "./hero3d/use-hero-mode";

// Selector del hero de la landing: el viaje 3D atado al scroll siempre; el
// hero estático sólo si no hay WebGL o si la escena falla en runtime.
export default function Hero() {
  const { mode, fallToStatic } = useHeroMode();
  if (mode === "3d") return <Hero3D onFail={fallToStatic} />;
  return <HeroStatic />;
}
