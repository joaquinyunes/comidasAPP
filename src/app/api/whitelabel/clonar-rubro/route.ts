export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

const Schema = z.object({ origenTenantId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "origenTenantId requerido" }, { status: 422 });

  const objetivo = ctx.tenantId;
  const origen = parsed.data.origenTenantId;
  if (origen === objetivo) return NextResponse.json({ error: "No podés clonar tu propio rubro" }, { status: 400 });

  const [catsOrigen, prodsOrigen] = await Promise.all([
    prisma.categoriaMenu.findMany({ where: { tenantId: origen } }),
    prisma.producto.findMany({ where: { tenantId: origen } }),
  ]);

  const catMap: Record<string, string> = {};
  for (const c of catsOrigen) {
    const { id, tenantId, createdAt, ...rest } = c;
    const creada = await prisma.categoriaMenu.create({ data: { ...rest, tenantId: objetivo } });
    catMap[id] = creada.id;
  }

  let nProd = 0;
  for (const p of prodsOrigen) {
    const { id, tenantId, categoriaId, createdAt, updatedAt, ...rest } = p;
    await prisma.producto.create({ data: { ...rest, tenantId: objetivo, categoriaId: (categoriaId ? catMap[categoriaId] : null) as string } as any });
    nProd += 1;
  }

  return NextResponse.json({ data: { categorias: catsOrigen.length, productos: nProd } }, { status: 201 });
}
