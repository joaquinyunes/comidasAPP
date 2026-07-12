import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/fidelizacion/clientes-recurrentes — Clientes con recurrencia
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get("nivel") || undefined;
    const limite = Math.min(parseInt(searchParams.get("limite") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (nivel) where.nivel = nivel;

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: [{ totalVisitas: "desc" }, { puntos: "desc" }],
      take: limite,
      select: {
        id: true,
        nombre: true,
        nivel: true,
        puntos: true,
        totalVisitas: true,
        totalGastado: true,
        ultimaVisita: true,
        _count: { select: { favoritos: true } },
      },
    });

    return NextResponse.json({ data: clientes });
  } catch (error) {
    console.error("Error GET /api/fidelizacion/clientes-recurrentes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
