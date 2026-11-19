export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ClienteLocalSchema } from "@/lib/validation";
import { crearPedidoLocal } from "@/lib/pedidos/crear-local";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";
import { codigoQrValido } from "@/lib/qr-local";
import { ipBloqueadaPorCodigo, registrarCodigoMalo, contarPedidoDeMesa } from "@/lib/limite-qr";

const limite = rateLimit({ maxRequests: 20, windowMs: 60_000 });

const respuesta429 = (espera: number) =>
  NextResponse.json({ error: "Demasiadas solicitudes. Probá de nuevo en unos minutos.", retryAfter: espera }, { status: 429, headers: { "Retry-After": String(espera) } });

const HTTP_POR_CODIGO = {
  LOCAL_NO_ENCONTRADO: 404,
  PRODUCTO_INVALIDO: 409,
  SIN_STOCK: 409,
  CUPON_INVALIDO: 422,
} as const;

export async function POST(req: NextRequest) {
  const limitada = await limite(req);
  if (limitada) return limitada;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "desconocida";
  const ipTope = await ipBloqueadaPorCodigo(ip);
  if (ipTope.bloqueado) return respuesta429(ipTope.espera);

  if (!codigoQrValido(req.headers.get("x-qr-local-codigo"))) {
    await registrarCodigoMalo(ip);
    return NextResponse.json({ error: "Escaneá el QR del local para pedir." }, { status: 403 });
  }

  const parsed = ClienteLocalSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Tope por mesa/referencia: aunque alguien tenga el código, no puede inundar la cocina de una mesa.
  const topeMesa = await contarPedidoDeMesa(parsed.data.referencia.trim().toLowerCase().slice(0, 50));
  if (topeMesa.bloqueado) return respuesta429(topeMesa.espera);

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
