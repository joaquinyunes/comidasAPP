"use client";

import { useEffect, useState } from "react";

// Scrollspy: devuelve el id de la sección (de `ids`) que cruza la franja
// central de la pantalla. Cada sección debe tener ese id en el DOM.
export function useCategoriaActiva(ids: string[]): string | null {
  const [activa, setActiva] = useState<string | null>(null);
  const clave = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !clave) return;
    const lista = clave.split("|");
    const io = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.find((e) => e.isIntersecting);
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    lista.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [clave]);

  return activa;
}
