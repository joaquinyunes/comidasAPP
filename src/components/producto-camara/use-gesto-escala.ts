"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { limitarPxPorCm, pxPorCmInicial } from "./escala";

interface Punto {
  x: number;
  y: number;
}

// Gestos del visor: un dedo arrastra el producto; dos dedos (pellizco) o la
// rueda cambian la escala (px por cm) hasta que la tarjeta de referencia
// coincida con la real. Todo con Pointer Events, sin dependencias.
export function useGestoEscala(anchoPantalla: number) {
  const [pxPorCm, setPxPorCm] = useState(() => pxPorCmInicial(anchoPantalla || 390));
  const [offset, setOffset] = useState<Punto>({ x: 0, y: 0 });

  const punteros = useRef(new Map<number, Punto>());
  const ultimaDistancia = useRef<number | null>(null);
  const anchoRef = useRef(anchoPantalla);
  useEffect(() => {
    anchoRef.current = anchoPantalla;
  }, [anchoPantalla]);

  // Si el ancho cambia de verdad (rotar el teléfono) se recalcula el inicial.
  const primerAncho = useRef(anchoPantalla);
  useEffect(() => {
    if (anchoPantalla && primerAncho.current !== anchoPantalla) {
      primerAncho.current = anchoPantalla;
      setPxPorCm(limitarPxPorCm(pxPorCmInicial(anchoPantalla), anchoPantalla));
    }
  }, [anchoPantalla]);

  const alBajar = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    ultimaDistancia.current = null;
  }, []);

  const alMover = useCallback((e: React.PointerEvent) => {
    const previo = punteros.current.get(e.pointerId);
    if (!previo) return;
    const actual = { x: e.clientX, y: e.clientY };
    punteros.current.set(e.pointerId, actual);

    if (punteros.current.size === 1) {
      setOffset((o) => ({ x: o.x + (actual.x - previo.x), y: o.y + (actual.y - previo.y) }));
      return;
    }
    if (punteros.current.size >= 2) {
      const [a, b] = Array.from(punteros.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (ultimaDistancia.current !== null && ultimaDistancia.current > 0) {
        const factor = dist / ultimaDistancia.current;
        setPxPorCm((v) => limitarPxPorCm(v * factor, anchoRef.current));
      }
      ultimaDistancia.current = dist;
    }
  }, []);

  const alSoltar = useCallback((e: React.PointerEvent) => {
    punteros.current.delete(e.pointerId);
    ultimaDistancia.current = null;
  }, []);

  const alRueda = useCallback((e: React.WheelEvent) => {
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    setPxPorCm((v) => limitarPxPorCm(v * factor, anchoRef.current));
  }, []);

  const centrar = useCallback(() => setOffset({ x: 0, y: 0 }), []);
  const fijarPxPorCm = useCallback(
    (v: number) => setPxPorCm(limitarPxPorCm(v, anchoRef.current)),
    []
  );

  return {
    pxPorCm,
    offset,
    fijarPxPorCm,
    centrar,
    handlers: {
      onPointerDown: alBajar,
      onPointerMove: alMover,
      onPointerUp: alSoltar,
      onPointerCancel: alSoltar,
      onWheel: alRueda,
    },
  };
}
