// ============================================================
// Cálculo del progreso de un pedido a partir de sus ítems.
// Módulo puro.
// ============================================================

import type { EstadoItem } from "./estados";

interface ItemProgreso {
  estado: string;
  anulado: boolean;
}

const PESO_ESTADO: Record<EstadoItem, number> = {
  recibido: 0,
  en_pausa: 0.25,
  en_preparacion: 0.5,
  listo: 0.9,
  entregado: 1,
  anulado: 1,
};

// Devuelve un porcentaje 0–100 según cuánto avanzaron los ítems no anulados.
export function progresoPedido(items: readonly ItemProgreso[]): number {
  const vigentes = items.filter((i) => !i.anulado);
  if (vigentes.length === 0) return 0;
  const suma = vigentes.reduce(
    (acc, i) => acc + (PESO_ESTADO[i.estado as EstadoItem] ?? 0),
    0
  );
  return Math.round((suma / vigentes.length) * 100);
}

// Deriva el estado del pedido a partir del estado de sus ítems no anulados.
export function estadoPedidoDerivado(
  items: readonly ItemProgreso[]
): "recibido" | "en_preparacion" | "listo" | "entregado" | null {
  const vigentes = items.filter((i) => !i.anulado);
  if (vigentes.length === 0) return null;
  if (vigentes.every((i) => i.estado === "entregado")) return "entregado";
  if (vigentes.every((i) => i.estado === "listo" || i.estado === "entregado")) return "listo";
  if (vigentes.some((i) => i.estado === "en_preparacion" || i.estado === "en_pausa")) return "en_preparacion";
  return "recibido";
}
