import { NextResponse } from "next/server";

// ============================================
// GET /api/reservas/disponibilidad
// ============================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");
  const hora = searchParams.get("hora");
  const personas = parseInt(searchParams.get("personas") || "2");

  // TODO: Buscar mesas disponibles en Prisma
  const mesasDisponibles = [
    {
      id: "m1",
      numero: "1",
      capacidad: 4,
      sector: "Salón Principal",
      posicionX: 100,
      posicionY: 150,
    },
    {
      id: "m3",
      numero: "3",
      capacidad: 6,
      sector: "Salón Principal",
      posicionX: 300,
      posicionY: 150,
    },
    {
      id: "m4",
      numero: "4",
      capacidad: 4,
      sector: "Terraza",
      posicionX: 100,
      posicionY: 250,
    },
  ].filter((m) => m.capacidad >= personas);

  return NextResponse.json(mesasDisponibles);
}

// ============================================
// POST /api/reservas
// ============================================
export async function POST(request: Request) {
  const body = await request.json();

  // TODO: Guardar en Prisma, enviar confirmación
  const nuevaReserva = {
    id: crypto.randomUUID(),
    ...body,
    estado: "confirmada",
    recordatorioEnviado: false,
    createdAt: new Date(),
  };

  return NextResponse.json(nuevaReserva, { status: 201 });
}
