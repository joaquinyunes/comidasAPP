export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { pedidosPorHora, ventasPorDia } from "@/lib/reportes/tendencias";

// ============================================
// GET /api/reportes/tendencias
//
// Ventas por día (14 días), productos más vendidos y horas pico
// (30 días). Todo calculado sobre cobros y pedidos reales.
// ============================================

const DIAS_SERIE = 14;
const DIAS_RANKING = 30;
const TOP = 8;

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const ahora = new Date();
    const desdeSerie = new Date(ahora.getTime() - DIAS_SERIE * 86400000);
    const desdeRanking = new Date(ahora.getTime() - DIAS_RANKING * 86400000);

    const [pagos, pedidos, items] = await Promise.all([
      prisma.pago.findMany({
        where: { tenantId: ctx.tenantId, estado: "completado", createdAt: { gte: desdeSerie } },
        select: { monto: true, createdAt: true },
      }),
      prisma.pedido.findMany({
        where: { tenantId: ctx.tenantId, estado: { not: "cancelado" }, createdAt: { gte: desdeRanking } },
        select: { createdAt: true },
        take: 10000,
      }),
      prisma.pedidoItem.groupBy({
        by: ["productoId"],
        where: { tenantId: ctx.tenantId, anulado: false, createdAt: { gte: desdeRanking } },
        _sum: { cantidad: true, subtotal: true },
        orderBy: { _sum: { cantidad: "desc" } },
        take: TOP,
      }),
    ]);

    const productos = await prisma.producto.findMany({
      where: { id: { in: items.map((i) => i.productoId) } },
      select: { id: true, nombre: true },
    });
    const nombre = new Map(productos.map((p) => [p.id, p.nombre]));

    return NextResponse.json({
      data: {
        ventasPorDia: ventasPorDia(
          pagos.map((p) => ({ monto: Number(p.monto), createdAt: p.createdAt })),
          DIAS_SERIE,
          ahora
        ),
        masVendidos: items.map((i) => ({
          productoId: i.productoId,
          nombre: nombre.get(i.productoId) ?? "Producto eliminado",
          unidades: i._sum.cantidad ?? 0,
          facturado: Number(i._sum.subtotal ?? 0),
        })),
        pedidosPorHora: pedidosPorHora(pedidos.map((p) => p.createdAt)),
      },
    });
  } catch (error) {
    console.error("Error GET /api/reportes/tendencias:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
