export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/clientes — clientes del local (para el panel)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

    const clientes = await prisma.cliente.findMany({
      where: {
        tenantId: ctx.tenantId,
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { nombre: { contains: q, mode: "insensitive" } },
                { telefono: { contains: q } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        puntos: true,
        nivel: true,
        totalGastado: true,
        totalVisitas: true,
        ultimaVisita: true,
        alergias: true,
        optInMarketing: true,
      },
      orderBy: [{ totalGastado: "desc" }, { nombre: "asc" }],
      take: limit,
    });

    return NextResponse.json({
      data: clientes.map((c) => ({ ...c, totalGastado: Number(c.totalGastado) })),
    });
  } catch (error) {
    console.error("Error GET /api/clientes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
