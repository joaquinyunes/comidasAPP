import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermiso } from "@/lib/panel/permisos";

// ============================================
// PATCH /api/configuracion/accesos/[id]
// Activa o desactiva el acceso de una persona (solo admin).
// Desactivar es la "baja": conserva el historial de pedidos y cobros.
// ============================================

const Cambio = z.object({ activo: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "*")) {
      return NextResponse.json({ error: "Solo un administrador puede cambiar accesos." }, { status: 403 });
    }

    const parsed = Cambio.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });

    const { id } = await params;
    if (id === ctx.usuarioId && !parsed.data.activo) {
      return NextResponse.json({ error: "No podés desactivar tu propio acceso." }, { status: 409 });
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id, tenantId: ctx.tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    await prisma.usuario.update({ where: { id }, data: { activo: parsed.data.activo } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error PATCH /api/configuracion/accesos/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
