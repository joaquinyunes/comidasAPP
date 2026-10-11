"use client";

import { useEffect, useState } from "react";

// Hora actual que se refresca sola. Sirve para que "hace 12 min" avance
// aunque no haya datos nuevos del servidor.
export function useAhora(cadaMs = 30000): number {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(t);
  }, [cadaMs]);

  return ahora;
}
