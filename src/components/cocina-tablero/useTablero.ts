"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Comanda } from "./tipos";

// Sondea el tablero de cocina. `recargar` fuerza una lectura
// inmediata (tras marcar un ítem).
export function useTablero(intervaloMs = 8000) {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vivo = useRef(true);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/cocina/tablero");
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      if (vivo.current) {
        setComandas(json.data ?? []);
        setError(null);
      }
    } catch {
      if (vivo.current) setError("Sin conexión con cocina.");
    } finally {
      if (vivo.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    vivo.current = true;
    // Lectura inicial + polling. `cargar` es async: el setState no es sincrónico.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
    const t = setInterval(cargar, intervaloMs);
    return () => {
      vivo.current = false;
      clearInterval(t);
    };
  }, [cargar, intervaloMs]);

  return { comandas, cargando, error, recargar: cargar };
}
