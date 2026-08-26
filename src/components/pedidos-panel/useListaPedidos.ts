"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PedidoLista } from "./tipos";

// Lista de pedidos del backend, refrescada por polling.
export function useListaPedidos(intervaloMs = 10000) {
  const [pedidos, setPedidos] = useState<PedidoLista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vivo = useRef(true);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/pedidos");
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      if (vivo.current) {
        setPedidos(Array.isArray(json) ? json : (json.data ?? []));
        setError(null);
      }
    } catch {
      if (vivo.current) setError("No pudimos cargar los pedidos.");
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

  return { pedidos, cargando, error, recargar: cargar };
}
