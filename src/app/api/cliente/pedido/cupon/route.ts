export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getTenantBySlug } from "@/lib/prisma";
import { evaluarCupon } from "@/lib/pedidos/cupon";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";

// ============================================
// POST /api/cliente/pedido/cupon — validar un código antes de pedir
// Acepta mesaId (pedido en el salón) o tenant (delivery).
// ============================================

const Schema = z.object({
  mesaId: z.string().uuid().optional(),
  tenant: z.string().optional(),
  codigo: z.string().min(3).max(20),
  subtotal: z.coerce.number().nonnegative(),
});

async function resolverTenantId(mesaId?: string, tenant?: string): Promise<string | null> {
  if (mesaId) {
    const mesa = await prisma.mesa.findFirst({ where: { id: mesaId }, select: { tenantId: true } });
    return mesa?.tenantId ?? null;
  }
  const t = await getTenantBySlug(tenant || SITE_TENANT_SLUG);
  return t?.id ?? null;
}

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });

  const tenantId = await resolverTenantId(parsed.data.mesaId, parsed.data.tenant);
  if (!tenantId) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });

  const cupon = await prisma.cupon.findFirst({
    where: { tenantId, codigo: parsed.data.codigo.toUpperCase() },
  });
  if (!cupon) {
    return NextResponse.json({ data: { valido: false, motivo: "Ese cupón no existe." } });
  }

  const ev = evaluarCupon(
    {
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: Number(cupon.valor),
      activo: cupon.activo,
      fechaInicio: cupon.fechaInicio,
      fechaFin: cupon.fechaFin,
      usosMaximos: cupon.usosMaximos,
      usosActuales: cupon.usosActuales,
      minimoCompra: Number(cupon.minimoCompra),
    },
    parsed.data.subtotal
  );

  return NextResponse.json({
    data: ev.valido
      ? { valido: true, codigo: cupon.codigo, descuento: ev.descuento, descripcion: ev.descripcion }
      : { valido: false, motivo: ev.motivo },
  });
}
