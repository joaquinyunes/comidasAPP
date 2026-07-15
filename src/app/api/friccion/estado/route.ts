import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { NextRequest } from "next/server";

// ============================================
// GET /api/friccion/estado — Health check para modo offline/LAN
// ============================================
export async function GET(request: NextRequest) {
  const context = await getTenantContext(request);
  const tenantId = context?.tenantId;

  let pedidos24h = 0;
  let mesasActivas = 0;
  let productosActivos = 0;
  let stockLineas = 0;

  try {
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const base = tenantId ? { tenantId } : {};
    const [p, m, pr, s] = await Promise.all([
      prisma.pedido.count({ where: { ...base, createdAt: { gte: desde } } }),
      prisma.mesa.count({ where: { ...base, estado: { not: "libre" } } }),
      prisma.producto.count({ where: { ...base, disponible: true } }),
      prisma.stockPorSucursal.count({ where: base }),
    ]);
    pedidos24h = p;
    mesasActivas = m;
    productosActivos = pr;
    stockLineas = s;
  } catch {
    // Mantener health-check accesible aunque falle la BD
  }

  return NextResponse.json({
    online: true,
    serverTime: new Date().toISOString(),
    autenticado: !!context,
    tenantId: tenantId ?? null,
    metricas: {
      pedidos24h,
      mesasActivas,
      productosActivos,
      stockLineas,
    },
  });
}
