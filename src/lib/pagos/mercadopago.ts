// ============================================================
// Cliente mínimo de MercadoPago (Checkout Pro).
// Se activa solo si MERCADOPAGO_ACCESS_TOKEN está seteado; si no,
// el sistema sigue funcionando con cobro solo-registro.
// ============================================================

const API = "https://api.mercadopago.com";

export function mpDisponible(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
  };
}

export interface PreferenciaInput {
  pedidoId: string;
  monto: number;
  descripcion: string;
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl?: string;
}

// Devuelve el init_point al que se redirige al cliente para pagar.
export async function crearPreferencia(input: PreferenciaInput): Promise<{ initPoint: string; preferenceId: string }> {
  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      items: [
        {
          title: input.descripcion,
          quantity: 1,
          unit_price: Math.round(input.monto * 100) / 100,
          currency_id: "ARS",
        },
      ],
      external_reference: input.pedidoId,
      back_urls: input.backUrls,
      auto_return: "approved",
      notification_url: input.notificationUrl,
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`MercadoPago preferencia falló (${res.status}): ${detalle.slice(0, 200)}`);
  }
  const data = (await res.json()) as { id: string; init_point: string };
  return { initPoint: data.init_point, preferenceId: data.id };
}

export interface PagoMP {
  status: string; // approved | pending | rejected | ...
  externalReference: string | null;
  amount: number;
}

export async function consultarPago(paymentId: string): Promise<PagoMP> {
  const res = await fetch(`${API}/v1/payments/${paymentId}`, { headers: headers() });
  if (!res.ok) throw new Error(`MercadoPago consulta de pago falló (${res.status})`);
  const d = (await res.json()) as {
    status: string;
    external_reference: string | null;
    transaction_amount: number;
  };
  return { status: d.status, externalReference: d.external_reference, amount: d.transaction_amount };
}
