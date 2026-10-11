"use client";

import { montoPropina, totalConPropina } from "@/lib/pedidos/precio";
import { cobrarPedido } from "@/components/pedidos-panel/accionesPedido";
import type { Carrito } from "@/lib/salon/carrito";
import type { PedidoSalon } from "./tipos";

// Acciones del mozo sobre una mesa. Cada una devuelve { ok, mensaje }
// y nunca lanza: el que llama decide qué mostrar.

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

async function leerError(res: Response, porDefecto: string): Promise<string> {
  const json = await res.json().catch(() => ({}));
  return json?.error ?? porDefecto;
}

export async function cambiarEstadoMesa(mesaId: string, estado: string): Promise<Resultado> {
  try {
    const res = await fetch(`/api/mesas/${mesaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, mensaje: await leerError(res, "No se pudo cambiar la mesa.") };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}

export async function enviarPedido(mesaId: string, carrito: Carrito): Promise<Resultado> {
  try {
    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesaId,
        // Si el mozo toca dos veces, el servidor responde con el mismo pedido.
        idempotencyKey: crypto.randomUUID(),
        items: carrito.map((l) => ({
          productoId: l.productoId,
          cantidad: l.cantidad,
          ...(l.notas.trim() ? { notas: l.notas.trim() } : {}),
        })),
      }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, mensaje: await leerError(res, "No se pudo enviar el pedido.") };
  } catch {
    return { ok: false, mensaje: "Sin conexión. El pedido no se envió." };
  }
}

// Cobra todas las comandas abiertas de la mesa con el mismo método.
// La propina se reparte según el total de cada comanda.
export async function cobrarMesa(
  pedidos: PedidoSalon[],
  metodo: string,
  propinaPct: number
): Promise<Resultado & { cobrados: number }> {
  let cobrados = 0;
  for (const p of pedidos) {
    const propina = montoPropina(p.total, propinaPct);
    const r = await cobrarPedido(p.id, totalConPropina(p.total, propina), metodo, propina);
    if (!r.ok) {
      const resto = pedidos.length - cobrados;
      return {
        ok: false,
        cobrados,
        mensaje:
          cobrados > 0
            ? `Se cobraron ${cobrados}, pero quedaron ${resto} sin cobrar: ${r.mensaje ?? "error"}`
            : (r.mensaje ?? "No se pudo cobrar."),
      };
    }
    cobrados += 1;
  }
  return { ok: true, cobrados };
}
