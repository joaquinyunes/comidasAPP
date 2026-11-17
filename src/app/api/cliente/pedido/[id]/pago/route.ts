export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { solicitarCuentaCliente, METODOS_CUENTA } from "@/lib/pedidos/solicitar-cuenta";

// ============================================
// POST /api/cliente/pedido/[id]/pago — el cliente PIDE LA CUENTA (no paga).
// Esta ruta es pública: no puede marcar nada como pagado. El cobro lo registra el personal
// desde el panel (/api/pagos) o Mercado Pago por su webhook firmado.
// ============================================

const Schema = z.object({
  metodo: z.enum(METODOS_CUENTA),
  porcentajePropina: z.coerce.number().min(0).max(100).optional(),
  montoParcial: z.coerce.number().positive().optional(),
  // Con cuánto va a pagar en efectivo: solo informativo, no se usa para cobrar.
  montoEfectivo: z.coerce.number().min(0).optional(),
});

const HTTP_POR_CODIGO = { PEDIDO_NO_ENCONTRADO: 404, PEDIDO_CANCELADO: 409 } as const;

// S3: por IP; frena el martilleo.
const limite = rateLimit({
  maxRequests: 20,
  windowMs: 60_000,
  keyGenerator: (r) => "pago:" + (r.headers.get("x-forwarded-for") ?? "?").split(",")[0].trim(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limitada = await limite(req);
  if (limitada) return limitada;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (body === null) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });
  }

  const r = await solicitarCuentaCliente({ pedidoId: id, ...parsed.data });
  if (!r.ok) return NextResponse.json({ error: r.mensaje, codigo: r.codigo }, { status: HTTP_POR_CODIGO[r.codigo] });

  return NextResponse.json({
    data: {
      pagoId: "",
      yaPagado: r.yaPagado,
      cuentaSolicitada: !r.yaPagado,
      base: r.base,
      propina: r.propina,
      total: r.totalPagar,
      vuelto: 0,
      saldoPendiente: r.saldoPendiente,
      pedidoSaldado: r.yaPagado,
      mensaje: r.yaPagado
        ? "Este pedido ya estaba pagado."
        : "Avisamos al personal: en un momento te traen la cuenta y te cobran. Todavía no se cobró nada.",
    },
  });
}
