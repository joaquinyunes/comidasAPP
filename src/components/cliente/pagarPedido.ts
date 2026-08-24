"use client";

// Llamada de pago desde la mesa. La respuesta HTTP es la única
// fuente de verdad: si devuelve ok, el pago está hecho.

export type MetodoPago = "efectivo" | "tarjeta" | "qr" | "transferencia";

export interface RespuestaPago {
  ok: boolean;
  mensaje: string;
  vuelto?: number;
  total?: number;
  saldoPendiente?: number;
  pedidoSaldado?: boolean;
}

interface Args {
  pedidoId: string;
  metodo: MetodoPago;
  porcentajePropina: number;
  montoEfectivo?: number;
  montoParcial?: number;
}

export async function pagarConMercadoPago(
  pedidoId: string,
  porcentajePropina: number
): Promise<{ ok: boolean; initPoint?: string; mensaje?: string }> {
  try {
    const res = await fetch(`/api/cliente/pedido/${pedidoId}/pago/mercadopago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ porcentajePropina }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, mensaje: json?.error };
    return { ok: true, initPoint: json.data?.initPoint };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}

export async function pagarPedido(args: Args): Promise<RespuestaPago> {
  try {
    const res = await fetch(`/api/cliente/pedido/${args.pedidoId}/pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metodo: args.metodo,
        porcentajePropina: args.porcentajePropina,
        montoEfectivo: args.montoEfectivo,
        montoParcial: args.montoParcial,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, mensaje: json?.error ?? "No se pudo procesar el pago." };
    return {
      ok: true,
      mensaje: json.data?.mensaje ?? "Pago recibido.",
      vuelto: json.data?.vuelto,
      total: json.data?.total,
      saldoPendiente: json.data?.saldoPendiente,
      pedidoSaldado: json.data?.pedidoSaldado,
    };
  } catch {
    return { ok: false, mensaje: "Sin conexión. Probá de nuevo." };
  }
}
