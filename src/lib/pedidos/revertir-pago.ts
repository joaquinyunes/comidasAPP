// ============================================================
// Mercado Pago avisa un reembolso o contracargo (status refunded / charged_back) de un cobro
// que ya registramos. El pago pasa a «reembolsado» (la caja deja de contarlo), el pedido vuelve a
// «entregado» si estaba «pagado» (otra vez tiene saldo) y se avisa al personal.
// Idempotente: el mismo aviso repetido no duplica eventos ni avisos. Si el pago nunca se registró,
// solo se deja la alerta (no se inventa nada).
// ============================================================

import { prisma } from "@/lib/prisma";

interface Args {
  pedidoId: string;
  referencia: string; // "mp:<id>"
  motivo: "refunded" | "charged_back";
}

type Resultado = { revertido: boolean } | { error: string };

export async function revertirPagoPedido(args: Args): Promise<Resultado> {
  const pedido = await prisma.pedido.findUnique({ where: { id: args.pedidoId }, select: { id: true, tenantId: true } });
  if (!pedido) return { error: "Pedido no encontrado" };

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM pedidos WHERE id = ${pedido.id}::uuid FOR UPDATE`;
    const pago = await tx.pago.findFirst({ where: { pedidoId: pedido.id, referencia: args.referencia }, select: { id: true, estado: true, monto: true } });
    const etiqueta = args.motivo === "charged_back" ? "contracargo" : "reembolso";

    if (pago && pago.estado !== "completado") return { revertido: false }; // ya estaba revertido

    if (pago) {
      await tx.pago.update({ where: { id: pago.id }, data: { estado: "reembolsado" } });
      const actual = await tx.pedido.findUniqueOrThrow({ where: { id: pedido.id }, select: { estado: true } });
      if (actual.estado === "pagado") await tx.pedido.update({ where: { id: pedido.id }, data: { estado: "entregado" } });
    }
    await tx.pedidoEvento.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId: pedido.id,
        evento: pago ? "PAGO_REVERTIDO" : "PAGO_REVERTIDO_SIN_REGISTRO",
        metadata: { referencia: args.referencia, motivo: args.motivo, pagoId: pago?.id ?? null },
      },
    });
    await tx.notificacion.create({
      data: {
        tenantId: pedido.tenantId,
        tipo: "pago_revertido",
        titulo: `Mercado Pago informó un ${etiqueta}`,
        mensaje: pago
          ? `El cobro ${args.referencia} fue devuelto (${etiqueta}). El pedido volvió a tener saldo pendiente: cobrarlo de nuevo o revisar.`
          : `Mercado Pago informó un ${etiqueta} de ${args.referencia} que no figura en el sistema: revisar a mano.`,
        leida: false,
      },
    });
    return { revertido: !!pago };
  });
}
