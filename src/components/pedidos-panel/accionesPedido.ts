"use client";

// Acciones de staff sobre un pedido: cobrar y cancelar.

export async function cobrarPedido(
  pedidoId: string,
  montoTotal: number,
  metodoPago: string,
  propina = 0
): Promise<{ ok: boolean; mensaje?: string }> {
  try {
    const res = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId, monto: montoTotal, metodoPago, propina }),
    });
    if (res.ok) return { ok: true };
    const json = await res.json().catch(() => ({}));
    return { ok: false, mensaje: json?.error ?? "No se pudo cobrar." };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}

export async function cancelarPedido(pedidoId: string): Promise<{ ok: boolean; mensaje?: string }> {
  try {
    const res = await fetch(`/api/pedidos/${pedidoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "cancelado" }),
    });
    if (res.ok) return { ok: true };
    const json = await res.json().catch(() => ({}));
    return { ok: false, mensaje: json?.error ?? "No se pudo cancelar." };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}
