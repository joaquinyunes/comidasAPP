import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/ia/prediccion-stock — Predecir stock (datos reales)
// ============================================
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tenantId = ctx.tenantId;
  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [stock, ingredientes, pedidoItems, recetas] = await Promise.all([
    prisma.stockPorSucursal.findMany({
      where: { tenantId },
      select: { ingredienteId: true, cantidadActual: true },
    }),
    prisma.ingrediente.findMany({
      where: { tenantId },
      select: { id: true, nombre: true },
    }),
    prisma.pedidoItem.findMany({
      where: { tenantId, createdAt: { gte: desde }, anulado: false },
      select: { productoId: true, cantidad: true },
    }),
    prisma.receta.findMany({
      where: { tenantId },
      select: {
        productoId: true,
        recetaIngredientes: {
          select: { ingredienteId: true, cantidad: true },
        },
      },
    }),
  ]);

  const ventaPorProducto: Record<string, number> = {};
  for (const it of pedidoItems) {
    ventaPorProducto[it.productoId] =
      (ventaPorProducto[it.productoId] || 0) + it.cantidad;
  }

  const consumoDiario: Record<string, number> = {};
  for (const r of recetas) {
    const vendidas = ventaPorProducto[r.productoId] || 0;
    for (const ri of r.recetaIngredientes) {
      consumoDiario[ri.ingredienteId] =
        (consumoDiario[ri.ingredienteId] || 0) +
        (Number(ri.cantidad) * vendidas) / 30;
    }
  }

  const stockPorIng: Record<string, number> = {};
  for (const s of stock) {
    stockPorIng[s.ingredienteId] =
      (stockPorIng[s.ingredienteId] || 0) + Number(s.cantidadActual);
  }

  const nombrePorIng = Object.fromEntries(
    ingredientes.map((i) => [i.id, i.nombre])
  );

  const predicciones = Object.keys(stockPorIng)
    .map((ingId) => {
      const stockActual = stockPorIng[ingId];
      const consumo = consumoDiario[ingId] || 0;
      const diasRestantes = consumo > 0 ? Math.floor(stockActual / consumo) : 999;
      const fa = new Date();
      fa.setDate(fa.getDate() + diasRestantes);

      let urgencia: string = "baja";
      let recomendacion = "Stock suficiente";
      if (diasRestantes <= 2) {
        urgencia = "critica";
        recomendacion = "Pedido urgente necesario";
      } else if (diasRestantes <= 5) {
        urgencia = "alta";
        recomendacion = "Realizar pedido pronto";
      } else if (diasRestantes <= 10) {
        urgencia = "media";
        recomendacion = "Considerar reposición";
      }

      return {
        ingredienteId: ingId,
        ingredienteNombre: nombrePorIng[ingId] ?? ingId,
        stockActual,
        consumoDiarioPromedio: Math.round(consumo * 100) / 100,
        diasRestantes,
        fechaAgotamiento: diasRestantes < 30 ? fa : null,
        recomendacion,
        urgencia,
      };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  return NextResponse.json({ predicciones });
}
