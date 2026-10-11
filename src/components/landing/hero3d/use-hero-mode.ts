"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { hasWebgl } from "./has-webgl";

export type HeroMode = "3d" | "static";

let webglCache: boolean | null = null;
function webgl(): boolean {
  if (webglCache === null) webglCache = hasWebgl();
  return webglCache;
}

// El soporte de WebGL no cambia durante la visita: no hay nada que escuchar.
const subscribe = () => () => {};

// En el servidor y en la hidratación se asume el caso feliz ("3d"): así el
// primer paint ya tiene el layout final.
const getServerSnapshot = () => true;

// Decide qué hero mostrar: siempre "3d", salvo que el equipo no tenga WebGL o
// que la escena falle en runtime (ahí se cae al hero estático). No depende de
// "reducir movimiento" ni hay interruptor: el viaje 3D es la página.
export function useHeroMode(): { mode: HeroMode; fallToStatic: () => void } {
  const hasGl = useSyncExternalStore(subscribe, webgl, getServerSnapshot);
  const [failed, setFailed] = useState(false);

  const fallToStatic = useCallback(() => setFailed(true), []);

  const mode: HeroMode = failed || !hasGl ? "static" : "3d";
  return { mode, fallToStatic };
}
