// ============================================================
// El cliente, desde la mesa, PIDE LA CUENTA. No paga: un pedido solo pasa a «pagado» con un
// cobro real (Mercado Pago por webhook firmado, o el personal desde el panel con /api/pagos).
// Antes esta ruta pública aceptaba {"metodo":"qr"} y marcaba el pedido pagado y liberaba la
// mesa sin cobrar nada (hallazgo crítico de la revisión independiente).
// ============================================================

import { prisma } from "@/lib/prisma";
import { redondear2, montoPropina, totalConPropina } from "./precio";

export const METODOS_CUENTA = ["efectivo", "tarjeta", "qr", "transferencia"] as const;
export type MetodoCuenta = (typeof METODOS_CUENTA)[number];

export interface SolicitudCuenta {
  pedidoId: string;
  metodo: MetodoCuenta;
  porcentajePropina?: number;
  montoParcial?: number;
}

export type ResultadoCuenta =
  | {
      ok: true;
      yaPagado: boolean;
      base: number; // consumo que se va a cobrar
      propina: number;
      totalPagar: number;
      saldoPendiente: number;
    }
  | { ok: false; codigo: "PEDIDO_NO_ENCONTRADO" | "PEDIDO_CANCELADO"; mensaje: string };

export async function solicitarCuentaCliente(input: SolicitudCuenta): Promise<ResultadoCuenta> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: input.pedidoId },
    select: {
      id: true,
      tenantId: true,
      estado: true,
      total: true,
      mesa: { select: { numero: true } },
      pagos: { where: { estado: "completado" }, select: { monto: true, propina: true } },
    },
  });
  if (!pedido) return { ok: false, codigo: "PEDIDO_NO_ENCONTRADO", mensaje: "No encontramos el pedido." };
  if (pedido.estado === "cancelado") return { ok: false, codigo: "PEDIDO_CANCELADO", mensaje: "El pedido fue cancelado." };

  const consumoPagado = redondear2(pedido.pagos.reduce((a, p) => a + (Number(p.monto) - Number(p.propina)), 0));
  const saldo = redondear2(Math.max(0, Number(pedido.total) - consumoPagado));
  if (saldo <= 0) {
    return { ok: true, yaPagado: true, base: 0, propina: 0, totalPagar: 0, saldoPendiente: 0 };
  }

  const base = Math.min(input.montoParcial != null ? redondear2(input.montoParcial) : saldo, saldo);
  const propina = montoPropina(base, input.porcentajePropina ?? 0);
  const totalPagar = totalConPropina(base, propina);

  await prisma.pedidoEvento.create({
    data: {
      tenantId: pedido.tenantId,
      pedidoId: pedido.id,
      evento: "CUENTA_SOLICITADA",
      metadata: { metodo: input.metodo, base, propina, totalPagar },
    },
  });
  await prisma.notificacion
    .create({
      data: {
        tenantId: pedido.tenantId,
        tipo: "cuenta_solicitada",
        titulo: pedido.mesa ? `Mesa ${pedido.mesa.numero} pide la cuenta` : "Un cliente pide la cuenta",
        mensaje: `Cobrar $${Math.round(totalPagar)} con ${input.metodo}.`,
        leida: false,
      },
    })
    .catch((e) => console.error("[cuenta] aviso al personal falló:", e));

  return { ok: true, yaPagado: false, base, propina, totalPagar, saldoPendiente: saldo };
}
