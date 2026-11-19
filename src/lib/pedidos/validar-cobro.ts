// ============================================================
// Valida un cobro cargado por el personal (POST /api/pagos) contra el saldo del pedido.
// `monto` incluye la propina (igual que registrar-pago): consumo = monto - propina.
//  - Más que el saldo: se rechaza (no se cobra de más).
//  - Menos que el saldo: solo si el cobro se declara PARCIAL y trae un motivo.
//  - Saldo en cero: ya estaba pagado (respuesta idempotente).
// Función pura: el lock y la lectura del saldo los hace la ruta dentro de la transacción.
// ============================================================

import { redondear2 } from "./precio";

export const TOLERANCIA_COBRO = 0.01;

export interface EntradaCobro {
  total: number; // total del pedido
  cobrado: number; // consumo ya cobrado (pagos completados, sin propina)
  monto: number; // lo que se cobra ahora, con propina
  propina: number;
  parcial?: boolean;
  motivo?: string | null;
}

export type DecisionCobro =
  | { ok: true; saldoAntes: number; consumo: number; salda: boolean }
  | { ok: false; codigo: "YA_PAGADO" }
  | { ok: false; codigo: "EXCEDE_SALDO" | "PROPINA_INVALIDA" | "PARCIAL_SIN_MOTIVO" | "MONTO_MENOR_AL_SALDO"; status: 409 | 422; mensaje: string };

export function validarCobro(e: EntradaCobro): DecisionCobro {
  const saldoAntes = redondear2(Math.max(0, e.total - e.cobrado));
  if (saldoAntes <= TOLERANCIA_COBRO) return { ok: false, codigo: "YA_PAGADO" };

  const consumo = redondear2(e.monto - e.propina);
  if (consumo <= 0 || e.propina > consumo) {
    return { ok: false, codigo: "PROPINA_INVALIDA", status: 422, mensaje: "La propina no puede ser mayor que el consumo cobrado." };
  }
  if (consumo > saldoAntes + TOLERANCIA_COBRO) {
    return { ok: false, codigo: "EXCEDE_SALDO", status: 409, mensaje: `El consumo a cobrar ($${consumo}) supera el saldo del pedido ($${saldoAntes}).` };
  }
  const salda = consumo + TOLERANCIA_COBRO >= saldoAntes;
  if (!salda) {
    if (!e.parcial) {
      return { ok: false, codigo: "MONTO_MENOR_AL_SALDO", status: 422, mensaje: `El saldo es $${saldoAntes}. Para cobrar menos, marcá el cobro como parcial e indicá el motivo.` };
    }
    if (!e.motivo || e.motivo.trim().length < 3) {
      return { ok: false, codigo: "PARCIAL_SIN_MOTIVO", status: 422, mensaje: "Un cobro parcial necesita un motivo." };
    }
  }
  return { ok: true, saldoAntes, consumo, salda };
}
