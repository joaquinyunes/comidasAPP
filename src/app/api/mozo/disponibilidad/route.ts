export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sucursalId = searchParams.get("sucursalId") || ctx.sucursalId || undefined;

  const productos = await prisma.producto.findMany({
    where: { tenantId: ctx.tenantId, activo: true },
    select: { id: true, nombre: true, disponible: true, categoria: { select: { nombre: true } } },
    orderBy: { nombre: "asc" },
  });

  const whereStock: Record<string, unknown> = { tenantId: ctx.tenantId };
  if (sucursalId) whereStock.sucursalId = sucursalId;
  const stock = await prisma.stockPorSucursal.findMany({
    where: whereStock,
    include: { ingrediente: { select: { id: true, nombre: true, stockMinimo: true } } },
  });
  const quiebres = stock
    .filter((s) => {
      const minimo = s.ingrediente.stockMinimo ? Number(s.ingrediente.stockMinimo) : 0;
      return minimo > 0 && Number(s.cantidadActual) <= minimo;
    })
    .map((s) => ({ ingrediente: s.ingrediente.nombre }));

  return NextResponse.json({
    data: {
      productosNoDisponibles: productos
        .filter((p) => !p.disponible)
        .map((p) => ({ id: p.id, nombre: p.nombre, categoria: p.categoria.nombre })),
      quiebresIngredientes: quiebres,
    },
  });
}
