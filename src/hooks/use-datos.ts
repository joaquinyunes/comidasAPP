"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface EstadoDatos<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

// Lee una URL del backend y la mantiene fresca.
//  - Acepta respuestas `{ data }` o el valor directo.
//  - No consulta mientras la pestaña está oculta (ahorra red y batería).
//  - Un fallo queda contenido: se muestra el error y se sigue intentando.
export function useDatos<T>(url: string | null, intervaloMs = 15000): EstadoDatos<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vivo = useRef(true);

  const cargar = useCallback(async () => {
    if (!url) {
      setCargando(false);
      return;
    }
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      if (vivo.current) {
        setDatos((json?.data ?? json) as T);
        setError(null);
      }
    } catch {
      if (vivo.current) setError("No pudimos actualizar los datos.");
    } finally {
      if (vivo.current) setCargando(false);
    }
  }, [url]);

  useEffect(() => {
    vivo.current = true;
    // Lectura inicial: el setState ocurre tras el await, no sincrónicamente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
    if (!intervaloMs) {
      return () => {
        vivo.current = false;
      };
    }
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      void cargar();
    }, intervaloMs);
    return () => {
      vivo.current = false;
      clearInterval(t);
    };
  }, [cargar, intervaloMs]);

  return { datos, cargando, error, recargar: cargar };
}
