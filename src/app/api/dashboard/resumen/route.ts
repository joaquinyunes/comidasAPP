import { NextResponse } from "next/server";

// ============================================
// GET /api/dashboard/resumen
// ============================================
export async function GET() {
  // TODO: Reemplazar con queries reales a Prisma
  const resumen = {
    ventasHoy: 845000,
    ventasAyer: 720000,
    ticketPromedio: 42000,
    mesasOcupadas: 12,
    mesasTotales: 20,
    pedidosActivos: 8,
    clientesHoy: 34,
    stockCritico: 2,
  };

  return NextResponse.json(resumen);
}
