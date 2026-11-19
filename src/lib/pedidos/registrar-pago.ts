// ============================================================
// Registra un cobro YA RECIBIDO (hoy: aprobado por Mercado Pago) sobre un pedido.
//
// Reglas (hallazgos de la revisión independiente):
//  - Idempotente por (pedido, referencia): el mismo aviso dos veces, o a la vez, deja un solo pago
//    (índice único de la migración 0002).
//  - Dos pagos con DISTINTA referencia no se pisan: se toma el pedido con `SELECT … FOR UPDATE`
//    y el saldo se calcula adentro de la transacción.
//  - Solo se marca «pagado» (y se libera la mesa) si lo cobrado cubre el saldo pendiente.
//    Un pago menor queda como PAGO_PARCIAL y avisa al personal.
//  - Un pago aprobado que llega con el pedido ya saldado NO crea otro pago: deja un evento
//    PAGO_MP_SOBRANTE y una notificación para revisar (reembolso o error).
// ============================================================

import { prisma } from "@/lib/prisma";
import { mesaSinPendientes } from "./mesa-sin-pendientes";

interface Args {
  pedidoId: string;
  monto: number;
  propina?: number;
  metodo: string;
  referencia?: string; // id externo (ej. pago de MercadoPago)
}

type Resultado = { pagoId: string; yaPagado: boolean } | { error: string };

const esChoqueDeUnico = (e: unknown) => (e as { code?: string })?.code === "P2002";
const redondear = (n: number) => Math.round(n * 100) / 100;
const TOLERANCIA = 0.01;

export async function registrarPagoPedido(args: Args): Promise<Resultado> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: args.pedidoId },
    select: { id: true, tenantId: true, mesaId: true, estado: true },
  });
  if (!pedido) return { error: "Pedido no encontrado" };

  // Mismo aviso repetido: respuesta rápida sin transacción.
  if (args.referencia) {
    const previo = await prisma.pago.findFirst({
      where: { pedidoId: pedido.id, referencia: args.referencia },
      select: { id: true },
    });
    if (previo) return { pagoId: previo.id, yaPagado: true };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Bloquea la fila del pedido: dos cobros distintos del mismo pedido se hacen en fila.
      await tx.$queryRaw`SELECT id FROM pedidos WHERE id = ${pedido.id}::uuid FOR UPDATE`;

      const actual = await tx.pedido.findUniqueOrThrow({ where: { id: pedido.id }, select: { total: true, estado: true } });
      const total = actual.total;
      const cancelado = actual.estado === "cancelado";
      const pagos = await tx.pago.findMany({
        where: { pedidoId: pedido.id, estado: "completado" },
        select: { id: true, monto: true, propina: true },
      });
      const cobrado = redondear(pagos.reduce((a, p) => a + (Number(p.monto) - Number(p.propina)), 0));
      const saldo = redondear(Math.max(0, Number(total) - cobrado));
      const meta = { metodo: args.metodo, referencia: args.referencia ?? null, monto: args.monto };

      // Pedido ya saldado o CANCELADO: no se cobra dos veces ni se reabre. Se avisa para revisar (reembolso).
      if (cancelado || (saldo <= TOLERANCIA && pagos.length > 0)) {
        await tx.pedidoEvento.create({
          data: { tenantId: pedido.tenantId, pedidoId: pedido.id, evento: "PAGO_MP_SOBRANTE", metadata: { ...meta, saldo, motivo: cancelado ? "pedido_cancelado" : "pedido_saldado" } },
        });
        await tx.notificacion.create({
          data: {
            tenantId: pedido.tenantId,
            tipo: "pago_sobrante",
            titulo: cancelado ? "Pago aprobado sobre un pedido CANCELADO" : "Pago aprobado sobre un pedido ya pagado",
            mensaje: `Mercado Pago aprobó $${Math.round(args.monto)} (${args.referencia ?? "sin referencia"}) y el pedido ${cancelado ? "estaba cancelado" : "ya estaba saldado"}: revisar y reembolsar si corresponde.`,
            leida: false,
          },
        });
        return { pagoId: pagos[0]?.id ?? "", yaPagado: true };
      }

      const creado = await tx.pago.create({
        data: {
          tenantId: pedido.tenantId,
          pedidoId: pedido.id,
          monto: args.monto,
          propina: args.propina ?? 0,
          metodoPago: args.metodo,
          referencia: args.referencia ?? null,
          estado: "completado",
        },
        select: { id: true },
      });

      const cubre = redondear(args.monto - (args.propina ?? 0)) + TOLERANCIA >= saldo;
      if (cubre) {
        await tx.pedido.update({ where: { id: pedido.id }, data: { estado: "pagado" } });
        if (pedido.mesaId && (await mesaSinPendientes(tx, pedido.mesaId, pedido.id))) {
          await tx.mesa.update({ where: { id: pedido.mesaId }, data: { estado: "libre" } });
        }
      } else {
        await tx.notificacion.create({
          data: {
            tenantId: pedido.tenantId,
            tipo: "pago_parcial",
            titulo: "Pago de Mercado Pago menor al saldo",
            mensaje: `Llegaron $${Math.round(args.monto)} y el saldo era $${Math.round(saldo)}: el pedido sigue sin pagar. Revisar.`,
            leida: false,
          },
        });
      }
      await tx.pedidoEvento.create({
        data: {
          tenantId: pedido.tenantId,
          pedidoId: pedido.id,
          evento: cubre ? "PAGO_COMPLETADO" : "PAGO_PARCIAL",
          metadata: { pagoId: creado.id, ...meta, saldoAntes: saldo },
        },
      });

      return { pagoId: creado.id, yaPagado: false };
    });
  } catch (e) {
    // Otro aviso con la misma referencia ganó la carrera: devolvemos su pago.
    if (args.referencia && esChoqueDeUnico(e)) {
      const previo = await prisma.pago.findFirst({
        where: { pedidoId: pedido.id, referencia: args.referencia },
        select: { id: true },
      });
      if (previo) return { pagoId: previo.id, yaPagado: true };
    }
    throw e;
  }
}
