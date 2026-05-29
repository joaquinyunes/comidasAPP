export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const stock = await prisma.stockPorSucursal.findMany({
    where: { tenantId: ctx.tenantId },
    include: { ingrediente: { select: { id: true, nombre: true, stockMinimo: true, unidadMedida: true } } },
  });

  const sugerencias = stock
    .filter((s) => {
      const minimo = s.ingrediente.stockMinimo ? Number(s.ingrediente.stockMinimo) : 0;
      return minimo > 0 && Number(s.cantidadActual) <= minimo;
    })
    .map((s) => {
      const minimo = Number(s.ingrediente.stockMinimo);
      const actual = Number(s.cantidadActual);
      return {
        ingredienteId: s.ingrediente.id,
        nombre: s.ingrediente.nombre,
        unidad: s.ingrediente.unidadMedida,
        cantidadActual: actual,
        stockMinimo: minimo,
        sugeridoComprar: Math.ceil(minimo * 2 - actual),
      };
    })
    .sort((a, b) => a.cantidadActual - b.cantidadActual);

  return NextResponse.json({ data: { sugerencias, total: sugerencias.length } });
}
