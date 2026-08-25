export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/cocina/tablero — Comandas activas para la cocina
// ============================================

const PEDIDO_ACTIVO = ["recibido", "en_preparacion", "listo"];
const ITEM_VISIBLE = ["recibido", "en_preparacion", "en_pausa", "listo"];

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const pedidos = await prisma.pedido.findMany({
      where: {
        tenantId: ctx.tenantId,
        estado: { in: PEDIDO_ACTIVO },
        ...(ctx.sucursalId ? { sucursalId: ctx.sucursalId } : {}),
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        estado: true,
        tipo: true,
        createdAt: true,
        mesa: { select: { numero: true } },
        items: {
          where: { anulado: false, estado: { in: ITEM_VISIBLE } },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            cantidad: true,
            notas: true,
            estado: true,
            urgente: true,
            producto: { select: { nombre: true, estacion: true } },
          },
        },
      },
    });

    const comandas = pedidos
      .filter((p) => p.items.length > 0)
      .map((p) => ({
        pedidoId: p.id,
        estado: p.estado,
        tipo: p.tipo,
        mesa: p.mesa?.numero ?? null,
        desde: p.createdAt,
        items: p.items.map((i) => ({
          id: i.id,
          nombre: i.producto.nombre,
          estacion: i.producto.estacion,
          cantidad: i.cantidad,
          notas: i.notas,
          estado: i.estado,
          urgente: i.urgente,
        })),
      }));

    return NextResponse.json({ data: comandas, ahora: new Date().toISOString() });
  } catch (error) {
    console.error("Error GET /api/cocina/tablero:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
