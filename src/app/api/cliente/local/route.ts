export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ClienteLocalSchema } from "@/lib/validation";
import { crearPedidoLocal } from "@/lib/pedidos/crear-local";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";

const limite = rateLimit({ maxRequests: 20, windowMs: 60_000 });

const HTTP_POR_CODIGO = {
  LOCAL_NO_ENCONTRADO: 404,
  PRODUCTO_INVALIDO: 409,
  SIN_STOCK: 409,
  CUPON_INVALIDO: 422,
} as const;

export async function POST(req: NextRequest) {
  const limitada = await limite(req);
  if (limitada) return limitada;

  const codigoEsperado = process.env.NEXT_PUBLIC_QR_LOCAL_CODIGO;
  const codigoRecibido = req.headers.get("x-qr-local-codigo");
  if (!codigoEsperado || codigoRecibido !== codigoEsperado) {
    return NextResponse.json({ error: "Escaneá el QR del local para pedir." }, { status: 403 });
  }

  const parsed = ClienteLocalSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 422 }
    );
  }

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
