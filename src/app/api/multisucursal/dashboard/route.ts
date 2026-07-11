import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/multisucursal/dashboard — Visión consolidada por sucursal
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

    const sucursales = await prisma.sucursal.findMany({
      where: { tenantId: context.tenantId },
      select: { id: true, nombre: true, activa: true },
      orderBy: { nombre: "asc" },
    });

    const agregado = await prisma.pedido.groupBy({
      by: ["sucursalId"],
      where: {
        tenantId: context.tenantId,
        createdAt: { gte: new Date(desde), lte: new Date(`${hasta}T23:59:59Z`) },
      },
      _sum: { total: true },
      _count: { _all: true },
    });

    const porSucursal = sucursales.map((s) => {
      const a = agregado.find((x) => x.sucursalId === s.id);
      const ventas = a ? Number(a._sum.total ?? 0) : 0;
      const pedidos = a?._count._all ?? 0;
      return {
        sucursalId: s.id,
        nombre: s.nombre,
        activa: s.activa,
        ventas,
        pedidos,
        ticketPromedio: pedidos > 0 ? Math.round((ventas / pedidos) * 100) / 100 : 0,
      };
    });

    const totalVentas = porSucursal.reduce((acc, s) => acc + s.ventas, 0);
    const totalPedidos = porSucursal.reduce((acc, s) => acc + s.pedidos, 0);

    return NextResponse.json({
      data: porSucursal,
      resumen: {
        sucursales: sucursales.length,
        sucursalesActivas: sucursales.filter((s) => s.activa).length,
        totalVentas,
        totalPedidos,
        ticketPromedioGlobal: totalPedidos > 0 ? Math.round((totalVentas / totalPedidos) * 100) / 100 : 0,
      },
      periodo: { desde, hasta },
    });
  } catch (error) {
    console.error("Error GET /api/multisucursal/dashboard:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
