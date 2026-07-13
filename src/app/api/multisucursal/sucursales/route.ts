import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/multisucursal/sucursales — Listar sucursales del tenant
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const sucursales = await prisma.sucursal.findMany({
      where: { tenantId: context.tenantId },
      include: {
        _count: { select: { mesas: true, pedidos: true, sectores: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: sucursales });
  } catch (error) {
    console.error("Error GET /api/multisucursal/sucursales:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
