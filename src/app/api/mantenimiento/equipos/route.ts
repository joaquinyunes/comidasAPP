export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const equipos = await prisma.equipo.findMany({
    where: { tenantId: ctx.tenantId, activo: true },
    include: {
      intervenciones: { orderBy: { realizadoEn: "desc" }, take: 1, select: { tipo: true, realizadoEn: true, descripcion: true } },
      temperaturas: { orderBy: { createdAt: "desc" }, take: 5, select: { temperatura: true, fueraDeRango: true, createdAt: true, rangoMin: true, rangoMax: true } },
    },
    orderBy: { nombre: "asc" },
  });

  const ahora = Date.now();
  const data = equipos.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    tipo: e.tipo,
    ubicacion: e.ubicacion,
    proximaIntervencion: e.proximaIntervencion,
    vencido: e.proximaIntervencion ? ahora > e.proximaIntervencion.getTime() : false,
    ultimaIntervencion: e.intervenciones[0] ?? null,
    temperaturasFueraDeRango: e.temperaturas.filter((t) => t.fueraDeRango).length,
    ultimasTemperaturas: e.temperaturas,
  }));

  return NextResponse.json({ data });
}
