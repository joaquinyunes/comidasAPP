"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReservaApi } from "./tipos";

interface Filtro {
  fecha?: string;
  estado?: string;
}

// Carga las reservas del backend y las mantiene frescas.
export function useReservas(filtro: Filtro) {
  const [reservas, setReservas] = useState<ReservaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    const qs = new URLSearchParams();
    if (filtro.fecha) qs.set("fecha", filtro.fecha);
    if (filtro.estado) qs.set("estado", filtro.estado);
    qs.set("limit", "100");
    try {
      const res = await fetch(`/api/reservas?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setReservas(json.data ?? []);
    } catch {
      setError("No pudimos cargar las reservas.");
    } finally {
      setCargando(false);
    }
  }, [filtro.fecha, filtro.estado]);

  useEffect(() => {
    // Carga inicial al montar / cambiar filtro. El setState real
    // ocurre tras el await, no sincrónicamente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    cargar();
  }, [cargar]);

  return { reservas, cargando, error, recargar: cargar };
}
