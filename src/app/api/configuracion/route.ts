export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermiso } from "@/lib/panel/permisos";

// ============================================
// GET/PUT /api/configuracion — datos del local
//
// Nombre del negocio y datos de contacto de la sucursal principal.
// ============================================

const Cambios = z.object({
  nombre: z.string().trim().min(1).max(255).optional(),
  sucursal: z
    .object({
      nombre: z.string().trim().min(1).max(255).optional(),
      direccion: z.string().trim().max(300).nullable().optional(),
      telefono: z.string().trim().max(50).nullable().optional(),
      email: z.string().trim().email().max(255).nullable().optional(),
    })
    .optional(),
});

async function sucursalPrincipal(tenantId: string, sucursalId?: string | null) {
  return prisma.sucursal.findFirst({
    where: { tenantId, ...(sucursalId ? { id: sucursalId } : {}) },
    orderBy: { createdAt: "asc" },
    select: { id: true, nombre: true, direccion: true, telefono: true, email: true },
  });
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const [tenant, sucursal] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: ctx.tenantId }, select: { nombre: true, slug: true, plan: true } }),
      sucursalPrincipal(ctx.tenantId, ctx.sucursalId),
    ]);
    if (!tenant) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });

    return NextResponse.json({ data: { ...tenant, sucursal } });
  } catch (error) {
    console.error("Error GET /api/configuracion:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "config:actualizar")) {
      return NextResponse.json({ error: "No tenés permiso para cambiar la configuración." }, { status: 403 });
    }

    const parsed = Cambios.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });
    }
    const { nombre, sucursal } = parsed.data;

    if (nombre) {
      await prisma.tenant.update({ where: { id: ctx.tenantId }, data: { nombre } });
    }
    if (sucursal && Object.keys(sucursal).length > 0) {
      const actual = await sucursalPrincipal(ctx.tenantId, ctx.sucursalId);
      if (!actual) return NextResponse.json({ error: "El local no tiene sucursales" }, { status: 404 });
      await prisma.sucursal.update({ where: { id: actual.id }, data: sucursal });
    }

    await prisma.auditLog
      .create({
        data: {
          tenantId: ctx.tenantId,
          usuarioId: ctx.usuarioId,
          accion: "ACTUALIZAR",
          entidad: "Configuracion",
          entidadId: ctx.tenantId,
          valorNuevo: { nombre: nombre ?? null, sucursal: sucursal ?? null },
        },
      })
      .catch((e) => console.error("[PUT /api/configuracion] auditoría falló:", e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error PUT /api/configuracion:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
