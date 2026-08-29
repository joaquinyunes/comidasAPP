import { NextResponse } from "next/server";
import { getTenantBySlug, getDefaultSucursal, prisma } from "@/lib/prisma";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";

// ============================================
// GET /api/publico/zonas — zonas de reparto activas
// ============================================

export const runtime = "nodejs";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("tenant") || SITE_TENANT_SLUG;

  const tenant = await getTenantBySlug(slug);
  if (!tenant) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });
  const sucursal = await getDefaultSucursal(tenant.id);
  if (!sucursal) return NextResponse.json({ data: [] });

  const zonas = await prisma.zonaReparto.findMany({
    where: { tenantId: tenant.id, sucursalId: sucursal.id, activa: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, tiempoEstimadoMin: true, costoEnvio: true },
  });

  return NextResponse.json({
    data: zonas.map((z) => ({
      id: z.id,
      nombre: z.nombre,
      tiempoEstimadoMin: z.tiempoEstimadoMin,
      costoEnvio: Number(z.costoEnvio),
    })),
  });
}
