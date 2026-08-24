// ============================================================
// Aritmética de dinero para pedidos y pagos.
// Módulo puro. Todo en la moneda base (sin decimales de más).
// ============================================================

// Redondea a 2 decimales evitando errores de coma flotante.
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function subtotalLinea(precioUnitario: number, cantidad: number): number {
  return redondear2(precioUnitario * cantidad);
}

export function totalPedido(subtotales: readonly number[]): number {
  return redondear2(subtotales.reduce((a, b) => a + b, 0));
}

// Monto de propina para un porcentaje dado (0, 5, 10, 15…).
export function montoPropina(base: number, porcentaje: number): number {
  if (!Number.isFinite(porcentaje) || porcentaje <= 0) return 0;
  return redondear2(base * (porcentaje / 100));
}

export function totalConPropina(base: number, propina: number): number {
  return redondear2(base + Math.max(0, propina));
}

// Vuelto para pago en efectivo. Nunca negativo.
export function vueltoEfectivo(totalAPagar: number, montoRecibido: number): number {
  return redondear2(Math.max(0, montoRecibido - totalAPagar));
}

// El efectivo alcanza para cubrir el total.
export function efectivoSuficiente(totalAPagar: number, montoRecibido: number): boolean {
  return redondear2(montoRecibido) + 1e-9 >= redondear2(totalAPagar);
}
