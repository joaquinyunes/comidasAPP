export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermiso } from "@/lib/panel/permisos";
import { exportarDatosCliente } from "@/lib/clientes/exportar-datos";
import { anonimizarCliente } from "@/lib/clientes/anonimizar-cliente";

// ============================================
// Datos personales de un cliente (Ley 25.326)
// GET    → copia de sus datos en JSON (derecho de acceso)
// DELETE → anonimiza sus datos (derecho de supresión); requiere permiso de borrado
// ============================================

const Id = z.string().uuid();

const auditar = (tenantId: string, usuarioId: string, accion: string, id: string) =>
  prisma.auditLog
    .create({ data: { tenantId, usuarioId, accion, entidad: "Cliente", entidadId: id } })
    .catch((e) => console.error("[clientes/datos] auditoría falló:", e));

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "clientes:leer")) {
      return NextResponse.json({ error: "No tenés permiso para ver datos de clientes." }, { status: 403 });
    }
    const id = Id.safeParse((await params).id);
    if (!id.success) return NextResponse.json({ error: "Cliente inválido" }, { status: 400 });

    const datos = await exportarDatosCliente(ctx.tenantId, id.data);
    if (!datos) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    await auditar(ctx.tenantId, ctx.usuarioId, "EXPORTAR_DATOS", id.data);
    return NextResponse.json(datos, {
      headers: { "Content-Disposition": `attachment; filename="cliente-${id.data}.json"`, "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error GET /api/clientes/[id]/datos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "clientes:eliminar")) {
      return NextResponse.json({ error: "No tenés permiso para borrar datos de clientes." }, { status: 403 });
    }
    const id = Id.safeParse((await params).id);
    if (!id.success) return NextResponse.json({ error: "Cliente inválido" }, { status: 400 });

    if (!(await anonimizarCliente(ctx.tenantId, id.data))) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    await auditar(ctx.tenantId, ctx.usuarioId, "ANONIMIZAR_CLIENTE", id.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE /api/clientes/[id]/datos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
