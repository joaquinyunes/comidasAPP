export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const feedbacks = await prisma.feedback.findMany({
    where: { tenantId: ctx.tenantId, createdAt: { gte: desde } },
    include: { mesa: { select: { numero: true } } },
    orderBy: { createdAt: "desc" },
  });

  const porCalificacion: Record<string, number> = {};
  for (const f of feedbacks) porCalificacion[f.calificacion] = (porCalificacion[f.calificacion] ?? 0) + 1;

  const tristes = feedbacks
    .filter((f) => f.calificacion === "TRISTE")
    .slice(0, 10)
    .map((f) => ({ id: f.id, motivo: f.motivo, mesa: f.mesa?.numero ?? null, fecha: f.createdAt }));

  const total = feedbacks.length;
  const felizPct = total ? Math.round(((porCalificacion.FELIZ ?? 0) / total) * 100) : 0;

  return NextResponse.json({ data: { total, porCalificacion, felizPct, tristes, alertaDueno: tristes.length > 0 } });
}
