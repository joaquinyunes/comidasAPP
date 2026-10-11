export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/carta — productos con su disponibilidad y precio
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const productos = await prisma.producto.findMany({
      where: { tenantId: ctx.tenantId, deletedAt: null },
      select: {
        id: true,
        nombre: true,
        precio: true,
        disponible: true,
        destacado: true,
        estacion: true,
        categoria: { select: { nombre: true, orden: true } },
      },
      orderBy: [{ categoria: { orden: "asc" } }, { nombre: "asc" }],
    });

    return NextResponse.json({
      data: productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio),
        disponible: p.disponible,
        destacado: p.destacado,
        estacion: p.estacion,
        categoria: p.categoria?.nombre ?? "Otros",
      })),
    });
  } catch (error) {
    console.error("Error GET /api/carta:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
