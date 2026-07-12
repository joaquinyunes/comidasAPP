import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/fidelizacion/logistica — Resumen de fidelización (sin marketing)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [porNivel, total, top, cuponesActivos] = await Promise.all([
      prisma.cliente.groupBy({
        by: ["nivel"],
        where: { tenantId: context.tenantId, deletedAt: null },
        _count: { _all: true },
      }),
      prisma.cliente.count({ where: { tenantId: context.tenantId, deletedAt: null } }),
      prisma.cliente.findMany({
        where: { tenantId: context.tenantId, deletedAt: null },
        orderBy: [{ puntos: "desc" }],
        take: 5,
        select: { id: true, nombre: true, nivel: true, puntos: true, totalVisitas: true },
      }),
      prisma.cupon.count({ where: { tenantId: context.tenantId, activo: true, fechaFin: { gte: new Date() } } }),
    ]);

    return NextResponse.json({
      data: {
        totalClientes: total,
        porNivel: porNivel.reduce((acc, n) => ({ ...acc, [n.nivel]: n._count._all }), {}),
        topClientes: top,
        cuponesActivos,
      },
    });
  } catch (error) {
    console.error("Error GET /api/fidelizacion/logistica:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
