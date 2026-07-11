import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/personal/checklists/ejecuciones — Historial de ejecuciones
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || undefined;
    const plantillaId = searchParams.get("plantillaId") || undefined;
    const completo = searchParams.get("completo");
    const desde = searchParams.get("desde") || undefined;
    const hasta = searchParams.get("hasta") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;
    if (plantillaId) where.plantillaId = plantillaId;
    if (completo === "true") where.completo = true;
    if (completo === "false") where.completo = false;
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) (where.createdAt as Record<string, Date>).gte = new Date(desde);
      if (hasta) (where.createdAt as Record<string, Date>).lte = new Date(hasta);
    }

    const ejecuciones = await prisma.checklistEjecucion.findMany({
      where,
      include: {
        plantilla: { select: { id: true, nombre: true, tipo: true } },
        sucursal: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: ejecuciones });
  } catch (error) {
    console.error("Error GET /api/personal/checklists/ejecuciones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
