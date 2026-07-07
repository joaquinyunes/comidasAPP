import { NextResponse } from "next/server";
import type { MesaEstado } from "@/types";

// ============================================
// GET /api/mesas - Listar mesas
// ============================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sucursalId = searchParams.get("sucursalId");

  // TODO: Reemplazar con Prisma
  const mesas = [
    {
      id: "1",
      numero: "1",
      capacidad: 4,
      estado: "libre" as MesaEstado,
      posicionX: 100,
      posicionY: 150,
      sector: "Salón Principal",
    },
    {
      id: "2",
      numero: "2",
      capacidad: 2,
      estado: "comiendo" as MesaEstado,
      posicionX: 200,
      posicionY: 150,
      sector: "Salón Principal",
      mozo: "Carlos",
      tiempoSentado: 45,
      totalConsumido: 18500,
    },
    {
      id: "3",
      numero: "3",
      capacidad: 6,
      estado: "esperando_pedido" as MesaEstado,
      posicionX: 300,
      posicionY: 150,
      sector: "Salón Principal",
      mozo: "María",
    },
    {
      id: "4",
      numero: "4",
      capacidad: 4,
      estado: "en_cocina" as MesaEstado,
      posicionX: 100,
      posicionY: 250,
      sector: "Terraza",
      mozo: "Carlos",
    },
    {
      id: "5",
      numero: "5",
      capacidad: 2,
      estado: "esperando_cuenta" as MesaEstado,
      posicionX: 200,
      posicionY: 250,
      sector: "Terraza",
      mozo: "María",
      tiempoSentado: 82,
      totalConsumido: 32000,
    },
    {
      id: "6",
      numero: "6",
      capacidad: 8,
      estado: "reservada" as MesaEstado,
      posicionX: 300,
      posicionY: 250,
      sector: "Terraza",
    },
  ];

  return NextResponse.json(mesas);
}

// ============================================
// POST /api/mesas - Crear mesa
// ============================================
export async function POST(request: Request) {
  const body = await request.json();

  // TODO: Validar con Zod y guardar en Prisma
  const nuevaMesa = {
    id: crypto.randomUUID(),
    ...body,
    estado: "libre",
    qrCode: `MESA-${body.numero}-${crypto.randomUUID().slice(0, 8)}`,
  };

  return NextResponse.json(nuevaMesa, { status: 201 });
}
