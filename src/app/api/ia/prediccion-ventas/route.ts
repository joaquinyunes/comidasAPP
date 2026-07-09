import { NextRequest, NextResponse } from "next/server";
import { IAPredictivaService } from "@/lib/ia-predictiva";

// ============================================
// GET /api/ia/prediccion-ventas — Predecir ventas
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "tenant-demo-001";
    const dias = parseInt(searchParams.get("dias") || "7");

    const predicciones = await IAPredictivaService.predecirVentas(tenantId, dias);

    return NextResponse.json({ predicciones });
  } catch (error) {
    console.error("Error en predicción de ventas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
