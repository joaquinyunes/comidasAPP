export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mesaId = searchParams.get("mesaId");
  if (!mesaId) return NextResponse.json({ error: "mesaId requerido" }, { status: 400 });

  const mesa = await prisma.mesa.findFirst({ where: { id: mesaId } });
  if (!mesa) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });

  const productos = await prisma.producto.findMany({
    where: { tenantId: mesa.tenantId, disponible: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precio: true,
      alergenos: true,
      nivelPicante: true,
      tiempoPreparacionMin: true,
      categoria: { select: { id: true, nombre: true } },
    },
    orderBy: { nombre: "asc" },
  });

  const porCategoria: Record<string, any[]> = {};
  for (const p of productos) {
    const cat = p.categoria.nombre;
    (porCategoria[cat] ||= []).push({ id: p.id, nombre: p.nombre, descripcion: p.descripcion, precio: Number(p.precio), alergenos: p.alergenos, nivelPicante: p.nivelPicante, tiempoMin: p.tiempoPreparacionMin });
  }

  return NextResponse.json({ data: Object.entries(porCategoria).map(([categoria, items]) => ({ categoria, items })), mesaId });
}
