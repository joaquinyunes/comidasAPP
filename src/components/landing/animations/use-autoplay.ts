"use client";

import { useEffect, useRef } from "react";

// Avanza solo cada `ms` mientras no esté pausado ni la pestaña oculta. El
// temporizador se rearma cuando cambia `clave` (p. ej. el índice activo), así
// que un cambio manual reinicia la cuenta en vez de saltar enseguida.
export function useAutoplay(avanzar: () => void, pausado: boolean, clave: unknown, ms = 5600) {
  const cb = useRef(avanzar);
  useEffect(() => {
    cb.current = avanzar;
  });

  useEffect(() => {
    if (pausado) return;
    const id = window.setTimeout(() => {
      try {
        if (!document.hidden) cb.current();
      } catch {
        // decorativo: un paso fallido no debe frenar el resto de la página
      }
    }, ms);
    return () => window.clearTimeout(id);
  }, [pausado, clave, ms]);
}
