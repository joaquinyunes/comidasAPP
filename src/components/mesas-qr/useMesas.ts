"use client";

import { useEffect, useState } from "react";

export interface MesaLista {
  id: string;
  numero: string;
  capacidad: number;
  estado: string;
  sector: { nombre: string } | null;
}

export function useMesas() {
  const [mesas, setMesas] = useState<MesaLista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/mesas")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (vivo) setMesas(json.data ?? []);
      })
      .catch(() => {
        if (vivo) setError("No pudimos cargar las mesas.");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return { mesas, cargando, error };
}
