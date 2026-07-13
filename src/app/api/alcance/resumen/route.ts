export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

const MONEDAS = [
  { codigo: "ARS", simbolo: "$", nombre: "Peso argentino" },
  { codigo: "USD", simbolo: "U$S", nombre: "Dólar" },
  { codigo: "EUR", simbolo: "€", nombre: "Euro" },
  { codigo: "BRL", simbolo: "R$", nombre: "Real" },
];

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const productos = await prisma.producto.findMany({
    where: { tenantId: ctx.tenantId, disponible: true },
    select: { id: true, nombre: true, destacado: true, idiomas: true, categoria: { select: { nombre: true } } },
    orderBy: { nombre: "asc" },
  });

  const porCategoria: Record<string, any[]> = {};
  for (const p of productos) {
    const cat = p.categoria.nombre;
    (porCategoria[cat] ||= []).push({ id: p.id, nombre: p.nombre, destacado: p.destacado, idiomas: p.idiomas, traducciones: Object.keys((p.idiomas as Record<string, unknown>) ?? {}).length });
  }

  const turisticos = productos.filter((p) => p.destacado).map((p) => ({ id: p.id, nombre: p.nombre }));

  return NextResponse.json({
    data: {
      monedas: MONEDAS,
      categorias: Object.entries(porCategoria).map(([categoria, items]) => ({ categoria, items })),
      turisticos,
      totalTraducidos: productos.filter((p) => p.idiomas && Object.keys((p.idiomas as Record<string, unknown>) ?? {}).length > 0).length,
    },
  });
}
