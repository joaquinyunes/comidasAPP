import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/operativo/stock-tiempo-real — Quiebres de stock visibles
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;

    const stock = await prisma.stockPorSucursal.findMany({
      where,
      include: { ingrediente: { select: { id: true, nombre: true, unidadMedida: true, stockMinimo: true } } },
    });

    const quiebres = stock
      .filter((s) => {
        const minimo = s.ingrediente.stockMinimo ? Number(s.ingrediente.stockMinimo) : 0;
        return minimo > 0 && Number(s.cantidadActual) <= minimo;
      })
      .map((s) => ({
        ingredienteId: s.ingrediente.id,
        nombre: s.ingrediente.nombre,
        unidad: s.ingrediente.unidadMedida,
        cantidadActual: Number(s.cantidadActual),
        stockMinimo: Number(s.ingrediente.stockMinimo ?? 0),
      }))
      .sort((a, b) => a.cantidadActual - b.cantidadActual);

    return NextResponse.json({ data: quiebres, total: quiebres.length });
  } catch (error) {
    console.error("Error GET /api/operativo/stock-tiempo-real:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
