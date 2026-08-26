"use client";

import { useCallback, useEffect, useState } from "react";

export interface CajaResumen {
  fecha: string;
  cantidad: number;
  total: number;
  propinas: number;
  porMetodo: Record<string, { total: number; cantidad: number }>;
}

export function useCajaResumen(fecha?: string, intervaloMs = 15000) {
  const [resumen, setResumen] = useState<CajaResumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const qs = fecha ? `?fecha=${fecha}` : "";
      const res = await fetch(`/api/caja/resumen${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setResumen(json.data ?? null);
      setError(null);
    } catch {
      setError("No pudimos cargar la caja.");
    }
  }, [fecha]);

  useEffect(() => {
    // Lectura inicial + polling. `cargar` es async: el setState no es sincrónico.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
    const t = setInterval(cargar, intervaloMs);
    return () => clearInterval(t);
  }, [cargar, intervaloMs]);

  return { resumen, error, recargar: cargar };
}
