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

  const visitas = await prisma.visitaMesa.findMany({
    where: { mesaId, tenantId: ctx.tenantId },
    include: { cliente: { select: { id: true, nombre: true } } },
    orderBy: { fecha: "desc" },
    take: 10,
  });

  return NextResponse.json({
    data: visitas.map((v) => ({
      id: v.id,
      cliente: v.cliente?.nombre ?? "Sin cliente",
      personas: v.personas,
      monto: v.monto ? Number(v.monto) : null,
      createdAt: v.fecha,
    })),
  });
}
