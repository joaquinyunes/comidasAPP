export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ClienteLocalSchema } from "@/lib/validation";
import { crearPedidoLocal } from "@/lib/pedidos/crear-local";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";
import { codigoQrValido } from "@/lib/qr-local";

const limite = rateLimit({ maxRequests: 20, windowMs: 60_000 });

// Tope por mesa/referencia: aunque alguien tenga el código, no puede inundar la cocina de una mesa.
const limitePorMesa = rateLimit({ maxRequests: 30, windowMs: 10 * 60_000, keyGenerator: (r) => "mesa:" + (r.headers.get("x-mesa-ref") ?? "?") });

const HTTP_POR_CODIGO = {
  LOCAL_NO_ENCONTRADO: 404,
  PRODUCTO_INVALIDO: 409,
  SIN_STOCK: 409,
  CUPON_INVALIDO: 422,
} as const;

export async function POST(req: NextRequest) {
  const limitada = await limite(req);
  if (limitada) return limitada;

  if (!codigoQrValido(req.headers.get("x-qr-local-codigo"))) {
    return NextResponse.json({ error: "Escaneá el QR del local para pedir." }, { status: 403 });
  }

  const parsed = ClienteLocalSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const topeMesa = await limitePorMesa(
    new NextRequest(req.url, { headers: { "x-mesa-ref": parsed.data.referencia.trim().toLowerCase().slice(0, 50) } })
  );
  if (topeMesa) return topeMesa;

  const r = await crearPedidoLocal({
    ...parsed.data,
    tenantSlug: parsed.data.tenant || SITE_TENANT_SLUG,
  });

  if (!r.ok) {
    return NextResponse.json(
      { error: r.mensaje, codigo: r.codigo, ...(r.faltantes ? { faltantes: r.faltantes } : {}) },
      { status: HTTP_POR_CODIGO[r.codigo] ?? 400 }
    );
  }

  return NextResponse.json(
    {
      data: {
        pedidoId: r.pedidoId,
        subtotal: r.subtotal,
        descuento: r.descuento,
        total: r.total,
        mensaje: r.duplicado ? "Este pedido ya lo habíamos recibido." : "¡Pedido enviado a cocina! Te lo llevamos a tu mesa.",
      },
    },
    { status: r.duplicado ? 200 : 201 }
  );
}
