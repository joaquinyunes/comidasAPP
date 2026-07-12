export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [categorias, productos, roles, promociones, modulos] = await Promise.all([
    prisma.categoriaMenu.count({ where: { tenantId: ctx.tenantId } }),
    prisma.producto.count({ where: { tenantId: ctx.tenantId, activo: true } }),
    prisma.rol.count({ where: { tenantId: ctx.tenantId } }),
    prisma.promocion.count({ where: { tenantId: ctx.tenantId, activa: true } }),
    prisma.modulo.count({ where: { tenantId: ctx.tenantId, activo: true } }),
  ]);

  return NextResponse.json({
    data: {
      categorias,
      productos,
      roles,
      promocionesActivas: promociones,
      modulosActivos: modulos,
      listoParaVender: categorias > 0 && productos > 0 && roles > 0,
    },
  });
}
