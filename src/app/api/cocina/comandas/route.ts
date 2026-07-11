import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/cocina/comandas — Comandas pendientes de impresión
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const soloSinImprimir = searchParams.get("sinImprimir") === "true";

    const where: Record<string, unknown> = {
      tenantId: context.tenantId,
      estado: { in: ["recibido", "aceptado", "en_preparacion"] },
    };
    if (sucursalId) where.sucursalId = sucursalId;

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        mesa: { select: { numero: true, sector: { select: { nombre: true } } } },
        items: {
          where: { anulado: false },
          include: { producto: { select: { nombre: true, estacion: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: pedidos });
  } catch (error) {
    console.error("Error GET /api/cocina/comandas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
