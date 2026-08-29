export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ClienteDeliverySchema } from "@/lib/validation";
import { crearPedidoDelivery } from "@/lib/pedidos/crear-delivery";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";

const limite = rateLimit({ maxRequests: 20, windowMs: 60_000 });

const HTTP_POR_CODIGO = {
  LOCAL_NO_ENCONTRADO: 404,
  ZONA_INVALIDA: 422,
  PRODUCTO_INVALIDO: 409,
  SIN_STOCK: 409,
  CUPON_INVALIDO: 422,
} as const;

export async function POST(req: NextRequest) {
  const limitada = await limite(req);
  if (limitada) return limitada;

  const parsed = ClienteDeliverySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const r = await crearPedidoDelivery({
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
        envio: r.envio,
        total: r.total,
        tiempoEstimadoMin: r.tiempoEstimadoMin,
        mensaje: r.duplicado ? "Este pedido ya lo habíamos recibido." : "¡Pedido confirmado! Te llamamos si hace falta.",
      },
    },
    { status: r.duplicado ? 200 : 201 }
  );
}
