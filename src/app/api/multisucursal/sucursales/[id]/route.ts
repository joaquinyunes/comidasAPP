import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SucursalConfigSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// PUT /api/multisucursal/sucursales/[id] — Configurar sucursal
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    const body = await request.json();
    const validation = validateInput(SucursalConfigSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const sucursal = await prisma.sucursal.findFirst({
      where: { id, tenantId: context.tenantId },
    });
    if (!sucursal) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }

    const data = validation.data;
    const actualizada = await prisma.sucursal.update({
      where: { id },
      data: {
        nombre: data.nombre ?? sucursal.nombre,
        direccion: data.direccion !== undefined ? data.direccion : sucursal.direccion,
        telefono: data.telefono !== undefined ? data.telefono : sucursal.telefono,
        email: data.email !== undefined ? data.email : sucursal.email,
        horario: data.horario !== undefined ? (data.horario as any) : sucursal.horario,
        activa: data.activa ?? sucursal.activa,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "ACTUALIZAR",
        entidad: "Sucursal",
        entidadId: id,
        valorNuevo: data as any,
      },
    });

    return NextResponse.json({ success: true, sucursal: actualizada });
  } catch (error) {
    console.error("Error PUT /api/multisucursal/sucursales/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
