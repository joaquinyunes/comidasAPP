// ============================================================
// Evaluación de un cupón de descuento sobre el subtotal de un
// pedido. Módulo puro: recibe el cupón ya cargado.
// ============================================================

import { redondear2 } from "./precio";

export interface CuponEvaluable {
  codigo: string;
  tipo: string; // "porcentaje" | "monto_fijo" | "2x1"
  valor: number;
  activo: boolean;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  usosMaximos: number;
  usosActuales: number;
  minimoCompra: number;
}

export type EvaluacionCupon =
  | { valido: true; descuento: number; descripcion: string }
  | { valido: false; motivo: string };

export function evaluarCupon(cupon: CuponEvaluable, subtotal: number): EvaluacionCupon {
  const ahora = Date.now();
  const inicio = new Date(cupon.fechaInicio).getTime();
  const fin = new Date(cupon.fechaFin).getTime();

  if (!cupon.activo) return { valido: false, motivo: "El cupón no está activo." };
  if (ahora < inicio) return { valido: false, motivo: "El cupón todavía no está vigente." };
  if (ahora > fin) return { valido: false, motivo: "El cupón venció." };
  if (cupon.usosActuales >= cupon.usosMaximos) {
    return { valido: false, motivo: "El cupón alcanzó su límite de usos." };
  }
  if (subtotal < cupon.minimoCompra) {
    return {
      valido: false,
      motivo: `Necesitás un mínimo de $${Math.round(cupon.minimoCompra)} para usar este cupón.`,
    };
  }

  let descuento: number;
  let descripcion: string;
  if (cupon.tipo === "porcentaje") {
    descuento = redondear2(subtotal * (cupon.valor / 100));
    descripcion = `${cupon.valor}% de descuento`;
  } else if (cupon.tipo === "monto_fijo") {
    descuento = Math.min(cupon.valor, subtotal);
    descripcion = `$${Math.round(cupon.valor)} de descuento`;
  } else {
    return { valido: false, motivo: "Ese tipo de cupón no se puede aplicar acá." };
  }

  descuento = redondear2(Math.min(descuento, subtotal));
  if (descuento <= 0) return { valido: false, motivo: "El cupón no genera descuento en este pedido." };

  return { valido: true, descuento, descripcion };
}
