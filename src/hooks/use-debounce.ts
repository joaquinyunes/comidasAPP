"use client";

import { useEffect, useState } from "react";

// Devuelve `valor` recién después de que dejó de cambiar `ms` milisegundos.
// Evita una consulta al servidor por cada tecla mientras se escribe.
export function useDebounce<T>(valor: T, ms = 300): T {
  const [estable, setEstable] = useState(valor);

  useEffect(() => {
    const t = setTimeout(() => setEstable(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);

  return estable;
}
