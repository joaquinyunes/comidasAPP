"use client";

import Hero3D from "./hero3d/hero-3d";
import HeroStatic from "./hero-static";
import { useHeroMode } from "./hero3d/use-hero-mode";

// Selector del hero de la landing: el viaje 3D atado al scroll por defecto;
// el hero estático si no hay WebGL, si se pidió menos movimiento o si la
// escena falla en runtime.
export default function Hero() {
  const { mode, canEnable3d, fallToStatic, enable3d } = useHeroMode();
  if (mode === "3d") return <Hero3D onFail={fallToStatic} />;
  return <HeroStatic onEnable3d={canEnable3d ? enable3d : undefined} />;
}
