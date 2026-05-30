export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

const Schema = z.object({
  tipo: z.string().min(1),
  descripcion: z.string().optional(),
  costo: z.number().nonnegative().optional(),
  proveedor: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const equipo = await prisma.equipo.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!equipo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });

  const realizadoEn = new Date();
  const proxima = equipo.frecuenciaMantenimientoDias
    ? new Date(realizadoEn.getTime() + equipo.frecuenciaMantenimientoDias * 24 * 60 * 60 * 1000)
    : null;

  const intervencion = await prisma.equipoIntervencion.create({
    data: {
      tenantId: ctx.tenantId,
      equipoId: equipo.id,
      tipo: parsed.data.tipo,
      descripcion: parsed.data.descripcion ?? null,
      costo: parsed.data.costo ?? null,
      proveedor: parsed.data.proveedor ?? null,
      realizadoEn,
    },
  });

  await prisma.equipo.update({ where: { id: equipo.id }, data: { ultimaIntervencion: realizadoEn, proximaIntervencion: proxima } });

  return NextResponse.json({ data: intervencion }, { status: 201 });
}
