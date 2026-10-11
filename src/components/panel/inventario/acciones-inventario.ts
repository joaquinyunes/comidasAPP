"use client";

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

interface Entrada {
  sucursalId: string;
  ingredienteId: string;
  lote: string | null;
  tipo: "entrada" | "salida" | "merma" | "ajuste";
  cantidad: number;
  motivo?: string;
}

// Registra un movimiento de stock. No lanza: devuelve { ok, mensaje }.
export async function registrarMovimiento(m: Entrada): Promise<Resultado> {
  try {
    const res = await fetch("/api/inventario/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sucursalId: m.sucursalId,
        ingredienteId: m.ingredienteId,
        tipo: m.tipo,
        cantidad: m.cantidad,
        ...(m.lote ? { lote: m.lote } : {}),
        ...(m.motivo ? { motivo: m.motivo } : {}),
      }),
    });
    if (res.ok) return { ok: true };
    const json = await res.json().catch(() => ({}));
    if (res.status === 409) {
      return { ok: false, mensaje: `No alcanza el stock: hay ${json?.disponible ?? 0}.` };
    }
    return { ok: false, mensaje: json?.error ?? "No se pudo registrar el movimiento." };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}
