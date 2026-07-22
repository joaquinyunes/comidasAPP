export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mesaId = searchParams.get("mesaId");
  if (!mesaId) return NextResponse.json({ error: "mesaId requerido" }, { status: 400 });

  const mesa = await prisma.mesa.findFirst({
    where: { id: mesaId, tenantId: ctx.tenantId },
    include: {
      pedidos: {
        where: { estado: { in: ["abierto", "en_proceso"] } },
        include: { cliente: { select: { id: true, nombre: true, alergias: true } } },
        take: 1,
      },
    },
  });
  if (!mesa) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });

  const cliente = mesa.pedidos[0]?.cliente ?? null;
  const alergenos: string[] = cliente?.alergias ?? [];

  const productos = await prisma.producto.findMany({
    where: { tenantId: ctx.tenantId, disponible: true },
    select: { id: true, nombre: true, alergenos: true },
  });

  const aEvitar = productos
    .filter((p) => p.alergenos.some((a) => alergenos.includes(a)))
    .map((p) => ({ id: p.id, nombre: p.nombre, alergenos: p.alergenos.filter((a) => alergenos.includes(a)) }));

  return NextResponse.json({
    data: {
      cliente: cliente ? { id: cliente.id, nombre: cliente.nombre } : null,
      alergenos,
      productosAEvitar: aEvitar,
    },
  });
}
