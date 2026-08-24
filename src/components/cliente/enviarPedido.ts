"use client";

// Envío del pedido al backend. Genera una clave de idempotencia
// por intento de compra para que un doble toque no duplique.

interface LineaEnvio {
  productoId: string;
  cantidad: number;
}

export interface RespuestaPedido {
  ok: boolean;
  pedidoId?: string;
  mensaje: string;
  faltantes?: string[];
}

function nuevaClave(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function enviarPedido(
  mesaId: string,
  lineas: LineaEnvio[],
  claveIdempotencia: string,
  cuponCodigo?: string
): Promise<RespuestaPedido> {
  try {
    const res = await fetch("/api/cliente/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesaId,
        items: lineas,
        idempotencyKey: claveIdempotencia,
        ...(cuponCodigo ? { cuponCodigo } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        mensaje: json?.error ?? "No pudimos enviar el pedido.",
        faltantes: json?.faltantes,
      };
    }
    return { ok: true, pedidoId: json.data?.pedidoId, mensaje: json.data?.mensaje ?? "Pedido enviado." };
  } catch {
    return { ok: false, mensaje: "Sin conexión. Probá de nuevo." };
  }
}

export interface CuponPreview {
  valido: boolean;
  codigo?: string;
  descuento?: number;
  descripcion?: string;
  motivo?: string;
}

export async function validarCupon(
  contexto: { mesaId?: string; tenant?: string },
  codigo: string,
  subtotal: number
): Promise<CuponPreview> {
  try {
    const res = await fetch("/api/cliente/pedido/cupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contexto, codigo, subtotal }),
    });
    const json = await res.json().catch(() => ({}));
    return json?.data ?? { valido: false, motivo: "No se pudo validar." };
  } catch {
    return { valido: false, motivo: "Sin conexión." };
  }
}

export { nuevaClave };
