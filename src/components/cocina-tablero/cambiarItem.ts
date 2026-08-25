"use client";

// Cambia el estado de un ítem vía PUT /api/pedidos/[id].
// El backend sincroniza solo el estado del pedido.

export async function cambiarEstadoItem(
  pedidoId: string,
  itemId: string,
  itemEstado: string
): Promise<{ ok: boolean; mensaje?: string }> {
  try {
    const res = await fetch(`/api/pedidos/${pedidoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, itemEstado }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, mensaje: json?.error ?? "No se pudo actualizar el ítem." };
    }
    return { ok: true };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}

// Siguiente estado natural en la barra de cocina.
export function siguienteEstado(actual: string): string | null {
  switch (actual) {
    case "recibido":
      return "en_preparacion";
    case "en_pausa":
      return "en_preparacion";
    case "en_preparacion":
      return "listo";
    case "listo":
      return "entregado";
    default:
      return null;
  }
}

export function etiquetaAccion(actual: string): string {
  switch (actual) {
    case "recibido":
      return "Empezar";
    case "en_pausa":
      return "Reanudar";
    case "en_preparacion":
      return "Marcar listo";
    case "listo":
      return "Entregar";
    default:
      return "";
  }
}
