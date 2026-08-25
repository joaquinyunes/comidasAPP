"use client";

// Un único PATCH para cambiar estado y/o asignar mesa.

interface Cambios {
  estado?: string;
  mesaId?: string | null;
}

export async function actualizarReserva(
  id: string,
  cambios: Cambios
): Promise<{ ok: boolean; mensaje?: string }> {
  try {
    const res = await fetch(`/api/reservas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, mensaje: json?.error ?? "No se pudo actualizar." };
    }
    return { ok: true };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}
