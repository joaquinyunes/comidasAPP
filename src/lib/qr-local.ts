// Código del QR del local (pedido en mesa). Es un SECRETO DE SERVIDOR: antes vivía en
// NEXT_PUBLIC_QR_LOCAL_CODIGO y Next lo metía en el JavaScript de todo el sitio, así que cualquiera
// podía leerlo y pedir "desde una mesa" sin estar en el local. Ahora: QR_LOCAL_CODIGO.
// Compatibilidad: si solo existe la variable vieja se usa igual (no se inyecta en el cliente porque
// ningún código de navegador la referencia), pero conviene renombrarla.

import { timingSafeEqual } from "node:crypto";

export function codigoLocalEsperado(): string {
  return process.env.QR_LOCAL_CODIGO || process.env.NEXT_PUBLIC_QR_LOCAL_CODIGO || "";
}

export function codigoQrValido(recibido: string | null | undefined): boolean {
  const esperado = codigoLocalEsperado();
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
