export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/salon/carta — la carta para tomar pedido
//
// Incluye los platos no disponibles (marcados) para que el mozo
// sepa por qué no puede ofrecerlos en lugar de no encontrarlos.
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const productos = await prisma.producto.findMany({
      where: { tenantId: ctx.tenantId },
      select: {
        id: true,
        nombre: true,
        precio: true,
        disponible: true,
        destacado: true,
        alergenos: true,
        categoria: { select: { nombre: true, orden: true } },
      },
      orderBy: { nombre: "asc" },
    });

    const porCategoria = new Map<string, { orden: number; items: unknown[] }>();
    for (const p of productos) {
      const nombre = p.categoria?.nombre ?? "Otros";
      const grupo = porCategoria.get(nombre) ?? { orden: p.categoria?.orden ?? 999, items: [] };
      grupo.items.push({
        id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio),
        disponible: p.disponible,
        destacado: p.destacado,
        alergenos: p.alergenos,
      });
      porCategoria.set(nombre, grupo);
    }

    const data = [...porCategoria.entries()]
      .sort((a, b) => a[1].orden - b[1].orden)
      .map(([categoria, g]) => ({ categoria, items: g.items }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error GET /api/salon/carta:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
