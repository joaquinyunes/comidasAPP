// ============================================================
// Pago de un pedido desde la mesa (cliente). Soporta pago total
// y pago parcial (dividir la cuenta): el pedido queda "pagado" y
// la mesa se libera recién cuando el consumo está cubierto.
// ============================================================

import { prisma } from "@/lib/prisma";
import {
  redondear2,
  montoPropina,
  totalConPropina,
  vueltoEfectivo,
  efectivoSuficiente,
} from "./precio";

export const METODOS_PAGO = ["efectivo", "tarjeta", "qr", "transferencia"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export interface PagarInput {
  pedidoId: string;
  metodo: MetodoPago;
  porcentajePropina?: number;
  montoEfectivo?: number;
  // Monto de consumo a pagar ahora. Si se omite, se paga el saldo completo.
  montoParcial?: number;
}

export type PagarResult =
  | {
      ok: true;
      yaPagado: boolean;
      pagoId: string;
      base: number; // consumo cubierto por ESTE pago
      propina: number;
      totalPagar: number;
      vuelto: number;
      saldoPendiente: number; // lo que falta pagar del pedido
      pedidoSaldado: boolean;
    }
  | { ok: false; codigo: "PEDIDO_NO_ENCONTRADO"; mensaje: string }
  | { ok: false; codigo: "PEDIDO_CANCELADO"; mensaje: string }
  | { ok: false; codigo: "MONTO_INVALIDO"; mensaje: string }
  | { ok: false; codigo: "EFECTIVO_INSUFICIENTE"; mensaje: string };

export async function pagarPedidoCliente(input: PagarInput): Promise<PagarResult> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: input.pedidoId },
    select: {
      id: true,
      tenantId: true,
      mesaId: true,
      estado: true,
      total: true,
      pagos: { where: { estado: "completado" }, select: { monto: true, propina: true } },
    },
  });

  if (!pedido) return { ok: false, codigo: "PEDIDO_NO_ENCONTRADO", mensaje: "No encontramos el pedido." };
  if (pedido.estado === "cancelado") {
    return { ok: false, codigo: "PEDIDO_CANCELADO", mensaje: "El pedido fue cancelado." };
  }

  const totalPedido = Number(pedido.total);
  const consumoPagado = redondear2(
    pedido.pagos.reduce((acc, p) => acc + (Number(p.monto) - Number(p.propina)), 0)
  );
  const saldoAntes = redondear2(Math.max(0, totalPedido - consumoPagado));

  if (saldoAntes <= 0) {
    return {
      ok: true,
      yaPagado: true,
      pagoId: "",
      base: 0,
      propina: 0,
      totalPagar: 0,
      vuelto: 0,
      saldoPendiente: 0,
      pedidoSaldado: true,
    };
  }

  // Cuánto consumo cubre este pago.
  let base = input.montoParcial != null ? redondear2(input.montoParcial) : saldoAntes;
  if (base <= 0) return { ok: false, codigo: "MONTO_INVALIDO", mensaje: "El monto debe ser mayor a cero." };
  if (base > saldoAntes) base = saldoAntes; // no se puede pagar de más

  const propina = montoPropina(base, input.porcentajePropina ?? 0);
  const totalPagar = totalConPropina(base, propina);

  let vuelto = 0;
  if (input.metodo === "efectivo") {
    const recibido = Number(input.montoEfectivo ?? 0);
    if (!efectivoSuficiente(totalPagar, recibido)) {
      return { ok: false, codigo: "EFECTIVO_INSUFICIENTE", mensaje: "El efectivo no alcanza para cubrir el pago." };
    }
    vuelto = vueltoEfectivo(totalPagar, recibido);
  }

  const saldoDespues = redondear2(Math.max(0, saldoAntes - base));
  const pedidoSaldado = saldoDespues <= 0.009;

  const pago = await prisma.$transaction(async (tx) => {
    const creado = await tx.pago.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId: pedido.id,
        monto: totalPagar,
        propina,
        metodoPago: input.metodo,
        estado: "completado",
      },
      select: { id: true },
    });

    await tx.pedidoEvento.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId: pedido.id,
        evento: pedidoSaldado ? "PAGO_COMPLETADO" : "PAGO_PARCIAL",
        metadata: { pagoId: creado.id, metodo: input.metodo, base, propina, totalPagar, saldoDespues },
      },
    });

    if (pedidoSaldado) {
      await tx.pedido.update({ where: { id: pedido.id }, data: { estado: "pagado" } });
      if (pedido.mesaId) {
        await tx.mesa.update({ where: { id: pedido.mesaId }, data: { estado: "libre" } });
      }
    }

    return creado;
  });

  return {
    ok: true,
    yaPagado: false,
    pagoId: pago.id,
    base,
    propina,
    totalPagar,
    vuelto,
    saldoPendiente: saldoDespues,
    pedidoSaldado,
  };
}
