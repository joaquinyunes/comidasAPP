import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/fidelizacion/historial-mesa — Historial de una mesa
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mesaId = searchParams.get("mesaId");
    if (!mesaId) {
      return NextResponse.json({ error: "mesaId es requerido" }, { status: 400 });
    }

    const historial = await prisma.visitaMesa.findMany({
      where: { mesaId, tenantId: context.tenantId },
      include: { cliente: { select: { id: true, nombre: true, nivel: true } } },
      orderBy: { fecha: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: historial });
  } catch (error) {
    console.error("Error GET /api/fidelizacion/historial-mesa:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
