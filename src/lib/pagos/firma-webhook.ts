// ============================================================
// Verifica la firma `x-signature` de los webhooks de MercadoPago.
// Formato del header: "ts=<epoch>,v1=<hmac sha256 hex>".
// Texto firmado: "id:<data.id en minúsculas>;request-id:<x-request-id>;ts:<ts>;"
// con el secreto de la integración (MERCADOPAGO_WEBHOOK_SECRET).
// ============================================================

import { createHmac, timingSafeEqual } from "node:crypto";

interface Args {
  secret: string;
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
}

export function firmaMpValida({ secret, xSignature, xRequestId, dataId }: Args): boolean {
  if (!xSignature || !xRequestId) return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    })
  ) as Record<string, string>;
  const { ts, v1 } = partes;
  if (!ts || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false;

  const esperado = createHmac("sha256", secret)
    .update(`id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`)
    .digest();
  return timingSafeEqual(esperado, Buffer.from(v1, "hex"));
}
