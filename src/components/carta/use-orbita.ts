"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import { ajustarAlPaso, indiceFrente, pasoGrados, profundidad } from "./orbita-geometria";

const AUTO_GRADOS_POR_SEG = 9;
const SENSIBILIDAD_ARRASTRE = 0.32;
const UMBRAL_ARRASTRE_PX = 5;

interface Estado {
  angulo: number;
  objetivo: number;
  arrastrando: boolean;
  pausa: boolean;
  visible: boolean;
  ultimoX: number;
  recorrido: number;
  movio: boolean;
  raf: number;
  t: number;
  frente: number;
}

// Motor de la órbita: un único requestAnimationFrame que escribe --giro en el
// anillo y --prof (profundidad) en cada plato; React sólo se entera cuando
// cambia el plato del frente.
export function useOrbita(total: number) {
  const anilloRef = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const estado = useRef<Estado>({
    angulo: 0,
    objetivo: 0,
    arrastrando: false,
    pausa: false,
    visible: true,
    ultimoX: 0,
    recorrido: 0,
    movio: false,
    raf: 0,
    t: 0,
    frente: 0,
  });
  const [frente, setFrente] = useState(0);
  const paso = pasoGrados(total);

  const aplicar = useCallback(() => {
    const anillo = anilloRef.current;
    if (!anillo) return;
    const s = estado.current;
    try {
      anillo.style.setProperty("--giro", `${s.angulo.toFixed(2)}deg`);
      const hijos = anillo.children;
      for (let i = 0; i < hijos.length; i++) {
        const p = profundidad(i, paso, s.angulo);
        (hijos[i] as HTMLElement).style.setProperty("--prof", p.toFixed(3));
      }
      const f = indiceFrente(s.angulo, paso, total);
      if (f !== s.frente) {
        s.frente = f;
        setFrente(f);
      }
    } catch {
      // decorativo
    }
  }, [paso, total]);

  const cuadroRef = useRef<(ts: number) => void>(() => {});

  const programar = useCallback(() => {
    const s = estado.current;
    if (!s.raf) s.raf = requestAnimationFrame((ts) => cuadroRef.current(ts));
  }, []);

  useEffect(() => {
    cuadroRef.current = (ts: number) => {
      const s = estado.current;
      s.raf = 0;
      const dt = s.t ? Math.min(0.05, (ts - s.t) / 1000) : 0.016;
      s.t = ts;
      if (!s.arrastrando && !s.pausa && s.visible) {
        s.objetivo -= AUTO_GRADOS_POR_SEG * dt;
      }
      s.angulo += (s.objetivo - s.angulo) * (1 - Math.pow(0.001, dt));
      aplicar();
      const sigue = s.visible || Math.abs(s.objetivo - s.angulo) > 0.05;
      if (sigue) s.raf = requestAnimationFrame((t2) => cuadroRef.current(t2));
      else s.t = 0;
    };
  }, [aplicar]);

  // Arranque + pausa cuando la órbita sale de pantalla.
  useEffect(() => {
    const escena = escenaRef.current;
    const s = estado.current;
    aplicar();
    programar();
    let io: IntersectionObserver | null = null;
    if (escena && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => {
        s.visible = !!e?.isIntersecting;
        if (s.visible) programar();
      });
      io.observe(escena);
    }
    return () => {
      io?.disconnect();
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [aplicar, programar]);

  const girar = useCallback(
    (delta: number) => {
      const s = estado.current;
      s.objetivo = ajustarAlPaso(s.objetivo, paso) - delta * paso;
      programar();
    },
    [paso, programar],
  );

  const alPresionar = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const s = estado.current;
    s.arrastrando = true;
    s.ultimoX = e.clientX;
    s.recorrido = 0;
    s.movio = false;
  }, []);

  const alMover = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const s = estado.current;
      if (!s.arrastrando) return;
      const dx = e.clientX - s.ultimoX;
      s.ultimoX = e.clientX;
      s.recorrido += Math.abs(dx);
      if (s.recorrido > UMBRAL_ARRASTRE_PX) {
        s.movio = true;
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // sin captura igual funciona dentro del elemento
          }
        }
      }
      s.objetivo += dx * SENSIBILIDAD_ARRASTRE;
      programar();
    },
    [programar],
  );

  const alSoltar = useCallback(() => {
    const s = estado.current;
    if (!s.arrastrando) return;
    s.arrastrando = false;
    s.objetivo = ajustarAlPaso(s.objetivo, paso);
    programar();
  }, [paso, programar]);

  const alClickCapturado = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const s = estado.current;
    if (s.movio) {
      e.preventDefault();
      e.stopPropagation();
      s.movio = false;
    }
  }, []);

  const pausar = useCallback((valor: boolean) => {
    estado.current.pausa = valor;
  }, []);

  return {
    anilloRef,
    escenaRef,
    frente,
    girar,
    pausar,
    manejadores: {
      onPointerDown: alPresionar,
      onPointerMove: alMover,
      onPointerUp: alSoltar,
      onPointerCancel: alSoltar,
      onClickCapture: alClickCapturado,
    },
  };
}
