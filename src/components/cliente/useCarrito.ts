"use client";

import { useMemo, useState } from "react";

export interface ItemMenu {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  alergenos: string[];
  nivelPicante: number;
  tiempoMin: number | null;
  imagenUrl?: string | null;
}

// Estado del carrito: cantidades por producto. Solo maneja el
// carrito, nada de red.
export function useCarrito(catalogo: ItemMenu[]) {
  const [cantidades, setCantidades] = useState<Record<string, number>>({});

  function cambiar(productoId: string, delta: number) {
    setCantidades((prev) => {
      const n = (prev[productoId] ?? 0) + delta;
      if (n <= 0) {
        const resto = { ...prev };
        delete resto[productoId];
        return resto;
      }
      return { ...prev, [productoId]: Math.min(n, 20) };
    });
  }

  function vaciar() {
    setCantidades({});
  }

  const porId = useMemo(() => new Map(catalogo.map((i) => [i.id, i])), [catalogo]);

  const lineas = useMemo(
    () =>
      Object.entries(cantidades).map(([productoId, cantidad]) => ({
        productoId,
        cantidad,
        item: porId.get(productoId) ?? null,
      })),
    [cantidades, porId]
  );

  const totalItems = useMemo(
    () => Object.values(cantidades).reduce((a, b) => a + b, 0),
    [cantidades]
  );

  const totalMonto = useMemo(
    () => lineas.reduce((acc, l) => acc + (l.item?.precio ?? 0) * l.cantidad, 0),
    [lineas]
  );

  return { cantidades, cambiar, vaciar, lineas, totalItems, totalMonto };
}
