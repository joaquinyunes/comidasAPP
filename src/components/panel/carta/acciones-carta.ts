"use client";

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

interface Cambios {
  disponible?: boolean;
  precio?: number;
  destacado?: boolean;
}

// Cambia un producto de la carta. No lanza: devuelve { ok, mensaje }.
export async function cambiarProducto(id: string, cambios: Cambios): Promise<Resultado> {
  try {
    const res = await fetch(`/api/carta/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    if (res.ok) return { ok: true };
    const json = await res.json().catch(() => ({}));
    return { ok: false, mensaje: json?.error ?? "No se pudo guardar el cambio." };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}
