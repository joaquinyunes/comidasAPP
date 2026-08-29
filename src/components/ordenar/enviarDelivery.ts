"use client";

interface LineaEnvio {
  productoId: string;
  cantidad: number;
}

export interface DatosEntrega {
  nombre: string;
  telefono: string;
  direccion: string;
  zonaId: string;
  notas?: string;
}

export interface RespuestaDelivery {
  ok: boolean;
  pedidoId?: string;
  mensaje: string;
  total?: number;
  tiempoEstimadoMin?: number;
  faltantes?: string[];
}

export function nuevaClave(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function enviarDelivery(
  lineas: LineaEnvio[],
  datos: DatosEntrega,
  clave: string,
  cuponCodigo?: string
): Promise<RespuestaDelivery> {
  try {
    const res = await fetch("/api/cliente/delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lineas,
        ...datos,
        idempotencyKey: clave,
        ...(cuponCodigo ? { cuponCodigo } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, mensaje: json?.error ?? "No pudimos tomar el pedido.", faltantes: json?.faltantes };
    }
    return {
      ok: true,
      pedidoId: json.data?.pedidoId,
      mensaje: json.data?.mensaje ?? "Pedido confirmado.",
      total: json.data?.total,
      tiempoEstimadoMin: json.data?.tiempoEstimadoMin,
    };
  } catch {
    return { ok: false, mensaje: "Sin conexión. Probá de nuevo." };
  }
}
