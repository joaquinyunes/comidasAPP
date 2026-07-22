import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/ia/prediccion-ventas — Predecir ventas (datos reales)
// ============================================
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dias = Math.min(parseInt(searchParams.get("dias") || "7"), 30);
  const tenantId = ctx.tenantId;

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const pedidos = await prisma.pedido.findMany({
    where: {
      tenantId,
      createdAt: { gte: desde },
      estado: { in: ["pagado", "entregado"] },
    },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const ventasPorDia: Record<string, number> = {};
  for (const p of pedidos) {
    const f = p.createdAt.toISOString().split("T")[0];
    ventasPorDia[f] = (ventasPorDia[f] || 0) + Number(p.total);
  }

  const valores = Object.values(ventasPorDia);
  const promedio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const ultimaSemana = valores.slice(-7);
  const promedioSem = ultimaSemana.length
    ? ultimaSemana.reduce((a, b) => a + b, 0) / ultimaSemana.length
    : promedio;

  const tendencia =
    promedioSem > promedio * 1.1
      ? "subida"
      : promedioSem < promedio * 0.9
        ? "bajada"
        : "estable";

  const predicciones: Array<{
    fecha: string;
    ventasEstimadas: number;
    confianza: number;
    tendencia: string;
  }> = [];

  const hoy = new Date();
  for (let i = 1; i <= dias; i++) {
    const f = new Date(hoy);
    f.setDate(f.getDate() + i);
    const diaSemana = f.getDay();
    const factorDia = [1.2, 1.0, 0.9, 1.0, 1.3, 1.5, 1.4][diaSemana];
    const estimado =
      promedioSem *
      factorDia *
      (tendencia === "subida" ? 1.05 : tendencia === "bajada" ? 0.95 : 1);

    predicciones.push({
      fecha: f.toISOString().split("T")[0],
      ventasEstimadas: Math.round(estimado),
      confianza: Math.min(0.9, 0.5 + (dias - i) * 0.05),
      tendencia,
    });
  }

  return NextResponse.json({ predicciones });
}
