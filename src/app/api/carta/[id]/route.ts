import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermiso } from "@/lib/panel/permisos";

// ============================================
// PATCH /api/carta/[id]
//
// Cambios chicos y frecuentes sobre un producto:
//  - disponible: lo marca o desmarca cualquiera que opere pedidos
//    (cocina avisa "se terminó"; el mozo deja de ofrecerlo).
//  - precio / destacado: requieren permiso de edición de productos.
// ============================================

const Cambios = z
  .object({
    disponible: z.boolean().optional(),
    precio: z.number().positive().max(10_000_000).optional(),
    destacado: z.boolean().optional(),
  })
  .refine((c) => Object.keys(c).length > 0, { message: "No hay nada para cambiar" });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const parsed = Cambios.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });
    }
    const { disponible, precio, destacado } = parsed.data;

    const soloDisponibilidad = precio === undefined && destacado === undefined;
    const permiso = soloDisponibilidad ? "pedidos:actualizar" : "productos:actualizar";
    if (!tienePermiso(ctx.permisos, permiso)) {
      return NextResponse.json({ error: "No tenés permiso para este cambio." }, { status: 403 });
    }

    const { id } = await params;
    const producto = await prisma.producto.findFirst({
      where: { id, tenantId: ctx.tenantId, deletedAt: null },
      select: { id: true, disponible: true, precio: true, destacado: true },
    });
    if (!producto) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        ...(disponible !== undefined ? { disponible } : {}),
        ...(precio !== undefined ? { precio } : {}),
        ...(destacado !== undefined ? { destacado } : {}),
      },
      select: { id: true, disponible: true, precio: true, destacado: true },
    });

    await prisma.auditLog
      .create({
        data: {
          tenantId: ctx.tenantId,
          usuarioId: ctx.usuarioId,
          accion: "ACTUALIZAR",
          entidad: "Producto",
          entidadId: id,
          valorAnterior: {
            disponible: producto.disponible,
            precio: Number(producto.precio),
            destacado: producto.destacado,
          },
          valorNuevo: {
            disponible: actualizado.disponible,
            precio: Number(actualizado.precio),
            destacado: actualizado.destacado,
          },
        },
      })
      .catch((e) => console.error("[PATCH /api/carta] auditoría falló:", e));

    return NextResponse.json({
      data: {
        id: actualizado.id,
        disponible: actualizado.disponible,
        precio: Number(actualizado.precio),
        destacado: actualizado.destacado,
      },
    });
  } catch (error) {
    console.error("Error PATCH /api/carta/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
