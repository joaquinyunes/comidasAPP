import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermiso } from "@/lib/panel/permisos";

// ============================================
// PATCH /api/marketing/cupones/[id] — pausar o reactivar un cupón
// ============================================

const Cambio = z.object({ activo: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "marketing:actualizar")) {
      return NextResponse.json({ error: "No tenés permiso para cambiar cupones." }, { status: 403 });
    }

    const parsed = Cambio.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });

    const { id } = await params;
    const cupon = await prisma.cupon.findFirst({
      where: { id, tenantId: ctx.tenantId },
      select: { id: true },
    });
    if (!cupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });

    await prisma.cupon.update({ where: { id }, data: { activo: parsed.data.activo } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error PATCH /api/marketing/cupones/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
