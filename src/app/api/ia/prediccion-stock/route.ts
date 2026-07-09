import { NextRequest, NextResponse } from "next/server";
import { IAPredictivaService } from "@/lib/ia-predictiva";

// ============================================
// GET /api/ia/prediccion-stock — Predecir stock
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "tenant-demo-001";

    const predicciones = await IAPredictivaService.predecirStock(tenantId);

    return NextResponse.json({ predicciones });
  } catch (error) {
    console.error("Error en predicción de stock:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
