"use client";

import { useEffect, useState } from "react";

export interface Zona {
  id: string;
  nombre: string;
  tiempoEstimadoMin: number;
  costoEnvio: number;
}

export function useZonas() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch("/api/publico/zonas")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("zonas"))))
      .then((j) => {
        if (vivo) setZonas(j.data ?? []);
      })
      .catch(() => {
        if (vivo) setError(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return { zonas, error };
}
