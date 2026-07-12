export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const mesas = await prisma.mesa.findMany({
    where: { tenantId: ctx.tenantId },
    select: { id: true, numero: true, estado: true, capacidad: true, updatedAt: true },
    orderBy: { numero: "asc" },
  });

  const ahora = Date.now();
  const data = mesas.map((m) => ({
    id: m.id,
    numero: m.numero,
    estado: m.estado,
    capacidad: m.capacidad,
    segundosDesdeCambio: Math.floor((ahora - m.updatedAt.getTime()) / 1000),
  }));

  return NextResponse.json({ data, ahora: new Date().toISOString() });
}
