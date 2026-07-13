export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const producto = await prisma.producto.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precio: true,
      alergenos: true,
      nivelPicante: true,
      tiempoPreparacionMin: true,
      disponible: true,
    },
  });
  if (!producto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({
    data: {
      ...producto,
      precio: Number(producto.precio),
      opciones: [
        "Sin cebolla",
        "Picante extra",
        "Para llevar",
        "Porcion extra",
      ],
      nota: "Personalización guiada: elegí solo lo posible según disponibilidad e inventario.",
    },
  });
}
