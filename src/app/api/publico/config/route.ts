import { NextResponse } from "next/server";
import { mpDisponible } from "@/lib/pagos/mercadopago";

// ============================================
// GET /api/publico/config — flags que el sitio cliente necesita
// ============================================

export function GET() {
  return NextResponse.json({
    data: {
      pagos: {
        mercadopago: mpDisponible(),
      },
    },
  });
}
