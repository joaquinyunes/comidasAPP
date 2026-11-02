"use client";

import { useEffect } from "react";

// La carta se monta vacía y los sectores llegan por fetch: el salto nativo del
// navegador a `/menu#cat-…` no encuentra el ancla. Cuando hay carta, se lleva
// al sector una sola vez (el margen superior lo da `scroll-margin-top`).
export function useSaltarAHash(listo: boolean) {
  useEffect(() => {
    if (!listo) return;
    try {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
      return () => clearTimeout(t);
    } catch {
      /* hash mal formado: se ignora */
    }
  }, [listo]);
}
