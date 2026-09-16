"use client";

interface LineaEnvio {
  productoId: string;
  cantidad: number;
}

export interface DatosLocal {
  referencia: string;
  notas?: string;
}

export interface RespuestaLocal {
  ok: boolean;
  pedidoId?: string;
  mensaje: string;
  total?: number;
  faltantes?: string[];
}

export function nuevaClave(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function enviarLocal(
  lineas: LineaEnvio[],
  datos: DatosLocal,
  clave: string,
  codigoQr: string,
  cuponCodigo?: string
): Promise<RespuestaLocal> {
  try {
    const res = await fetch("/api/cliente/local", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-qr-local-codigo": codigoQr },
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
    };
  } catch {
    return { ok: false, mensaje: "Sin conexión. Probá de nuevo." };
  }
}
