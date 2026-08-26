export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/caja/resumen?fecha=YYYY-MM-DD
// Arqueo del día: pagos por método, propinas, cantidad.
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const fechaParam = searchParams.get("fecha");
    const dia = fechaParam ? new Date(`${fechaParam}T00:00:00`) : new Date();
    const desde = new Date(dia);
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 1);

    const pagos = await prisma.pago.findMany({
      where: {
        tenantId: ctx.tenantId,
        estado: "completado",
        createdAt: { gte: desde, lt: hasta },
      },
      select: { monto: true, propina: true, metodoPago: true },
    });

    const porMetodo: Record<string, { total: number; cantidad: number }> = {};
    let total = 0;
    let propinas = 0;
    for (const p of pagos) {
      const monto = Number(p.monto);
      total += monto;
      propinas += Number(p.propina);
      const m = (porMetodo[p.metodoPago] ??= { total: 0, cantidad: 0 });
      m.total += monto;
      m.cantidad += 1;
    }

    return NextResponse.json({
      data: {
        fecha: desde.toISOString().slice(0, 10),
        cantidad: pagos.length,
        total: Math.round(total * 100) / 100,
        propinas: Math.round(propinas * 100) / 100,
        porMetodo,
      },
    });
  } catch (error) {
    console.error("Error GET /api/caja/resumen:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
