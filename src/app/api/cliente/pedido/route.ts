export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientePedidoSchema } from "@/lib/validation";
import { crearPedidoCliente } from "@/lib/pedidos/crear";
import { rateLimit } from "@/lib/rate-limit";

// Una mesa comparte IP (wifi del local): límite generoso pero real.
const limitePedidos = rateLimit({ maxRequests: 40, windowMs: 60_000 });

const HTTP_POR_CODIGO = {
  MESA_NO_ENCONTRADA: 404,
  PRODUCTO_INVALIDO: 409,
  SIN_STOCK: 409,
  CUPON_INVALIDO: 422,
} as const;

export async function POST(req: NextRequest) {
  const limitada = await limitePedidos(req);
  if (limitada) return limitada;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = ClientePedidoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const resultado = await crearPedidoCliente(parsed.data);

  if (!resultado.ok) {
    const status = HTTP_POR_CODIGO[resultado.codigo] ?? 400;
    return NextResponse.json(
      {
        error: resultado.mensaje,
        codigo: resultado.codigo,
        ...(resultado.codigo === "SIN_STOCK" ? { faltantes: resultado.faltantes } : {}),
      },
      { status }
    );
  }

  // Efecto secundario best-effort: nunca debe tumbar la respuesta.
  if (!resultado.duplicado) {
    await marcarMesaOcupada(parsed.data.mesaId);
  }

  return NextResponse.json(
    {
      data: {
        pedidoId: resultado.pedidoId,
        estado: resultado.estado,
        subtotal: resultado.subtotal,
        descuento: resultado.descuento,
        total: resultado.total,
        cupon: resultado.cupon,
        items: resultado.items,
        mensaje: resultado.duplicado
          ? "Este pedido ya lo habíamos recibido."
          : "Pedido confirmado. Lo preparan en cocina.",
      },
    },
    { status: resultado.duplicado ? 200 : 201 }
  );
}

async function marcarMesaOcupada(mesaId: string) {
  try {
    await prisma.mesa.updateMany({
      where: { id: mesaId, estado: { in: ["libre", "reservada"] } },
      data: { estado: "ocupada" },
    });
  } catch (e) {
    console.error("[api/cliente/pedido] no se pudo actualizar la mesa:", e);
  }
}

