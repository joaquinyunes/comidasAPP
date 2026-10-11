"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { hasWebgl } from "./has-webgl";

export type HeroMode = "3d" | "static";

const STORAGE_KEY = "cozizina:hero3d";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

let webglCache: boolean | null = null;
function webgl(): boolean {
  if (webglCache === null) webglCache = hasWebgl();
  return webglCache;
}

function readOptIn(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

// Foto del entorno como string (primitivo → estable para useSyncExternalStore).
function getSnapshot(): string {
  const gl = webgl() ? "gl" : "nogl";
  const reduce = window.matchMedia(REDUCED_QUERY).matches ? "reduce" : "motion";
  const optIn = readOptIn() ? "on" : "off";
  return `${gl}|${reduce}|${optIn}`;
}

// En el servidor y en la hidratación se asume el caso feliz ("3d"): así el
// primer paint ya tiene el layout final.
const getServerSnapshot = () => "gl|motion|off";

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

// Decide qué hero mostrar: "3d" salvo que no haya WebGL, que se haya pedido
// menos movimiento (sin haber aceptado el 3D) o que la escena falle. En el
// caso de menos movimiento se ofrece un botón para activarlo igual (queda
// recordado): se respeta la preferencia sin dejar a nadie sin la experiencia.
export function useHeroMode(): {
  mode: HeroMode;
  canEnable3d: boolean;
  fallToStatic: () => void;
  enable3d: () => void;
} {
  const env = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [failed, setFailed] = useState(false);

  const [gl, reduce, optIn] = env.split("|");
  const hasGl = gl === "gl";
  const needsOptIn = reduce === "reduce" && optIn !== "on";

  const fallToStatic = useCallback(() => setFailed(true), []);
  const enable3d = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "on");
    } catch {
      // Sin storage (modo privado): la elección vale sólo para esta visita.
    }
    setFailed(false);
    notify();
  }, []);

  const mode: HeroMode = failed || !hasGl || needsOptIn ? "static" : "3d";
  const canEnable3d = hasGl && !failed && needsOptIn;

  return { mode, canEnable3d, fallToStatic, enable3d };
}
