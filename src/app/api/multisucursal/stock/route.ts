import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/multisucursal/stock — Inventario por sucursal (independiente)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const soloBajo = searchParams.get("bajo") === "true";

    const sucursales = await prisma.sucursal.findMany({
      where: { tenantId: context.tenantId },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    const stock = await Promise.all(
      sucursales.map(async (s) => {
        const where: Record<string, unknown> = { sucursalId: s.id, tenantId: context.tenantId };
        const items = await prisma.stockPorSucursal.findMany({
          where,
          include: {
            ingrediente: { select: { id: true, nombre: true, unidadMedida: true, stockMinimo: true } },
          },
          orderBy: { ingrediente: { nombre: "asc" } },
        });

        const mapeado = items.map((it) => {
          const minimo = it.ingrediente.stockMinimo ? Number(it.ingrediente.stockMinimo) : 0;
          const actual = Number(it.cantidadActual);
          const bajo = minimo > 0 && actual <= minimo;
          return {
            ingredienteId: it.ingrediente.id,
            nombre: it.ingrediente.nombre,
            unidad: it.ingrediente.unidadMedida,
            cantidadActual: actual,
            stockMinimo: minimo,
            lote: it.lote,
            fechaVencimiento: it.fechaVencimiento,
            bajo,
          };
        });

        const filtrado = soloBajo ? mapeado.filter((m) => m.bajo) : mapeado;
        const countBajo = mapeado.filter((m) => m.bajo).length;
        return {
          sucursalId: s.id,
          nombre: s.nombre,
          items: filtrado,
          totalLineas: mapeado.length,
          lineasBajoStock: countBajo,
        };
      })
    );

    return NextResponse.json({ data: stock });
  } catch (error) {
    console.error("Error GET /api/multisucursal/stock:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
