"use client";

import { useEffect, useRef, useState } from "react";

// Tiempo que se ve la ilustración animada antes de dar paso a la foto real.
const ESPERA_MS = 1300;

// Cuándo mostrar la foto real: cuando la tarjeta entra en pantalla se empieza
// a descargar y, pasada la animación de la ilustración, se revela. Si la foto
// no existe (404) se queda la ilustración para siempre.
export function useFotoRevelada() {
  const ref = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);
  const [espera, setEspera] = useState(false);
  const [cargada, setCargada] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setVisto(true);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visto) return;
    const t = setTimeout(() => setEspera(true), ESPERA_MS);
    return () => clearTimeout(t);
  }, [visto]);

  return {
    ref,
    cargar: visto && !fallo,
    revelada: visto && espera && cargada && !fallo,
    onLoad: () => setCargada(true),
    onError: () => setFallo(true),
  };
}
