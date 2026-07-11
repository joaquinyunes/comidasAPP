import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/multisucursal/comparativas — Benchmarks entre sucursales
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const desde = searchParams.get("desde") || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
    const hasta = searchParams.get("hasta") || new Date().toISOString().slice(0, 10);

    const agregado = await prisma.pedido.groupBy({
      by: ["sucursalId"],
      where: {
        tenantId: context.tenantId,
        createdAt: { gte: new Date(desde), lte: new Date(`${hasta}T23:59:59Z`) },
      },
      _sum: { total: true },
      _count: { _all: true },
    });

    const sucursales = await prisma.sucursal.findMany({
      where: { tenantId: context.tenantId },
      select: { id: true, nombre: true },
    });
    const nombrePorId = Object.fromEntries(sucursales.map((s) => [s.id, s.nombre]));

    const filas = agregado.map((a) => {
      const ventas = Number(a._sum.total ?? 0);
      const pedidos = a._count._all;
      return {
        sucursalId: a.sucursalId,
        nombre: nombrePorId[a.sucursalId] ?? a.sucursalId,
        ventas,
        pedidos,
        ticketPromedio: pedidos > 0 ? Math.round((ventas / pedidos) * 100) / 100 : 0,
      };
    });

    const maxVentas = Math.max(0, ...filas.map((f) => f.ventas));
    const mejor = filas.find((f) => f.ventas === maxVentas) ?? null;

    // Ranking de eficiencia por ticket promedio
    const porTicket = [...filas].sort((a, b) => b.ticketPromedio - a.ticketPromedio);
    const brechaVentas = maxVentas > 0 ? maxVentas - Math.min(0, ...filas.map((f) => f.ventas)) : 0;

    return NextResponse.json({
      data: filas,
      benchmarks: {
        sucursalTopVentas: mejor,
        brechaVentas,
        rankingTicketPromedio: porTicket.map((f) => ({ sucursalId: f.sucursalId, nombre: f.nombre, ticketPromedio: f.ticketPromedio })),
      },
      periodo: { desde, hasta },
    });
  } catch (error) {
    console.error("Error GET /api/multisucursal/comparativas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
