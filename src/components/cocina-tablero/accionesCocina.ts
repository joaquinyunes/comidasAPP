"use client";

import { cambiarEstadoItem } from "./cambiarItem";
import type { ItemComanda } from "./tipos";

// Acciones de cocina sobre ítems. Devuelven { ok, mensaje } y no lanzan.

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

async function alternar(itemId: string, recurso: "urgente" | "pausa"): Promise<Resultado> {
  try {
    const res = await fetch(`/api/cocina/items/${itemId}/${recurso}`, { method: "POST" });
    if (res.ok) return { ok: true };
    const json = await res.json().catch(() => ({}));
    return { ok: false, mensaje: json?.error ?? "No se pudo actualizar el plato." };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}

export const alternarUrgente = (itemId: string) => alternar(itemId, "urgente");
export const alternarPausa = (itemId: string) => alternar(itemId, "pausa");

// Pasa varios ítems al mismo estado, uno tras otro (el backend valida cada paso).
export async function avanzarVarios(
  pedidoId: string,
  items: ItemComanda[],
  hacia: string
): Promise<Resultado> {
  for (const it of items) {
    const r = await cambiarEstadoItem(pedidoId, it.id, hacia);
    if (!r.ok) return r;
  }
  return { ok: true };
}
