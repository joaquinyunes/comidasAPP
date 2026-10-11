"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { HeroSceneHandle } from "./create-hero-scene";

interface Options {
  progressRef: RefObject<number>;
  onReady: () => void;
  onFail: () => void;
}

// Monta la escena three en `hostRef`. El módulo (y three con él) se importa
// de forma diferida: no entra en el bundle inicial de la landing.
export function useHeroScene(hostRef: RefObject<HTMLElement | null>, opts: Options) {
  const cbRef = useRef(opts);
  // Los callbacks se sincronizan después del render (no durante) y antes de
  // montar la escena (los efectos corren en orden de declaración).
  useEffect(() => {
    cbRef.current = opts;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let handle: HeroSceneHandle | null = null;

    import("./create-hero-scene")
      .then(({ createHeroScene }) => {
        if (cancelled) return;
        try {
          handle = createHeroScene({
            host,
            getProgress: () => cbRef.current.progressRef.current ?? 0,
            onReady: () => cbRef.current.onReady(),
            onFail: () => cbRef.current.onFail(),
          });
        } catch {
          cbRef.current.onFail();
        }
      })
      .catch(() => {
        if (!cancelled) cbRef.current.onFail();
      });

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, [hostRef]);
}
