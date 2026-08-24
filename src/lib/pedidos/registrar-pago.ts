// ============================================================
// Registra un pago ya cobrado: crea el Pago, deja el pedido en
// "pagado", libera la mesa y anota el evento. Idempotente:
// si el pedido ya tiene un pago completado, devuelve ese.
// Se llama siempre dentro de (o como) una transacción.
// ============================================================

import { prisma } from "@/lib/prisma";

interface Args {
  pedidoId: string;
  monto: number;
  propina?: number;
  metodo: string;
  referencia?: string; // id externo (ej. pago de MercadoPago)
}

export async function registrarPagoPedido(
  args: Args
): Promise<{ pagoId: string; yaPagado: boolean } | { error: string }> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: args.pedidoId },
    select: {
      id: true,
      tenantId: true,
      mesaId: true,
      estado: true,
      pagos: { where: { estado: "completado" }, select: { id: true } },
    },
  });
  if (!pedido) return { error: "Pedido no encontrado" };
  if (pedido.pagos.length > 0) return { pagoId: pedido.pagos[0].id, yaPagado: true };

  const pago = await prisma.$transaction(async (tx) => {
    const creado = await tx.pago.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId: pedido.id,
        monto: args.monto,
        propina: args.propina ?? 0,
        metodoPago: args.metodo,
        estado: "completado",
      },
      select: { id: true },
    });

    await tx.pedido.update({ where: { id: pedido.id }, data: { estado: "pagado" } });
    if (pedido.mesaId) {
      await tx.mesa.update({ where: { id: pedido.mesaId }, data: { estado: "libre" } });
    }
    await tx.pedidoEvento.create({
      data: {
        tenantId: pedido.tenantId,
        pedidoId: pedido.id,
        evento: "PAGO_COMPLETADO",
        metadata: { pagoId: creado.id, metodo: args.metodo, referencia: args.referencia ?? null },
      },
    });

    return creado;
  });

  return { pagoId: pago.id, yaPagado: false };
}
