export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

const Schema = z.object({
  temperatura: z.number(),
  rangoMin: z.number().optional(),
  rangoMax: z.number().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const equipo = await prisma.equipo.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!equipo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });

  const { temperatura, rangoMin, rangoMax } = parsed.data;
  const fuera = (rangoMin != null && temperatura < rangoMin) || (rangoMax != null && temperatura > rangoMax);

  const registro = await prisma.registroTemperatura.create({
    data: {
      tenantId: ctx.tenantId,
      equipoId: equipo.id,
      sucursalId: equipo.sucursalId,
      temperatura,
      rangoMin: rangoMin ?? null,
      rangoMax: rangoMax ?? null,
      fueraDeRango: fuera,
    },
  });

  return NextResponse.json({ data: registro, fueraDeRango: fuera }, { status: 201 });
}
