export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// GET /api/salud — ¿la app y la base de datos responden?
// Lo consulta el chequeo de disponibilidad (scripts/uptime.sh). No expone datos ni
// detalles de error: solo ok/no ok.
// ============================================

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[salud] base de datos sin respuesta:", error);
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
