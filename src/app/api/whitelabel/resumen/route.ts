export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

const IDIOMAS = ["es", "en", "pt", "it", "fr"];
const MONEDAS = ["ARS", "USD", "EUR", "BRL"];

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [tenant, totalTenants, modulos] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: ctx.tenantId }, select: { id: true, nombre: true, slug: true, logoUrl: true } }),
    prisma.tenant.count(),
    prisma.modulo.findMany({ where: { tenantId: ctx.tenantId }, select: { clave: true, nombre: true, activo: true } }),
  ]);

  const widgetSnippet = `<iframe src="https://${tenant?.slug ?? "tu-local"}.restaurantos.app/menu" width="100%" height="600" title="Pedí online"></iframe>`;

  return NextResponse.json({
    data: {
      tenant,
      totalTenants,
      idiomas: IDIOMAS,
      monedas: MONEDAS,
      modulos,
      widgetSnippet,
    },
  });
}
