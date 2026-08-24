export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pagarPedidoCliente, METODOS_PAGO } from "@/lib/pedidos/pagar";

const Schema = z.object({
  metodo: z.enum(METODOS_PAGO),
  porcentajePropina: z.coerce.number().min(0).max(100).optional(),
  montoEfectivo: z.coerce.number().min(0).optional(),
  montoParcial: z.coerce.number().positive().optional(),
});

const HTTP_POR_CODIGO = {
  PEDIDO_NO_ENCONTRADO: 404,
  PEDIDO_CANCELADO: 409,
  MONTO_INVALIDO: 422,
  EFECTIVO_INSUFICIENTE: 422,
} as const;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });
  }

  const r = await pagarPedidoCliente({ pedidoId: id, ...parsed.data });

  if (!r.ok) {
    return NextResponse.json(
      { error: r.mensaje, codigo: r.codigo },
      { status: HTTP_POR_CODIGO[r.codigo] ?? 400 }
    );
  }

  return NextResponse.json({
    data: {
      pagoId: r.pagoId,
      yaPagado: r.yaPagado,
      base: r.base,
      propina: r.propina,
      total: r.totalPagar,
      vuelto: r.vuelto,
      saldoPendiente: r.saldoPendiente,
      pedidoSaldado: r.pedidoSaldado,
      mensaje: r.yaPagado
        ? "Este pedido ya estaba pagado."
        : r.pedidoSaldado
        ? "Pago recibido. ¡Gracias!"
        : `Pago recibido. Queda un saldo de $${Math.round(r.saldoPendiente)}.`,
    },
  });
}
