export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [tristes, combos, mesasConQR] = await Promise.all([
    prisma.feedback.findMany({
      where: { tenantId: ctx.tenantId, calificacion: "TRISTE" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.promocion.findMany({
      where: { tenantId: ctx.tenantId, tipo: "COMBO", activa: true },
      select: { id: true, nombre: true, descripcion: true },
    }),
    prisma.mesa.count({ where: { tenantId: ctx.tenantId, qrCode: { not: null } } }),
  ]);

  return NextResponse.json({
    data: {
      alertaFeedback: tristes.map((t) => ({ id: t.id, motivo: t.motivo, mesa: t.mesaId ?? null })),
      combos,
      mesasConQR,
    },
  });
}
