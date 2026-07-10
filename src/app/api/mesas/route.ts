import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MesaSchema, SectorSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/mesas — Listar mesas
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get("sectorId") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const activa = searchParams.get("activa") !== "false";

    const where: Record<string, unknown> = {
      tenantId: context.tenantId,
      activa,
    };

    if (context.sucursalId) {
      where.sucursalId = context.sucursalId;
    }

    if (sectorId) where.sectorId = sectorId;
    if (estado) where.estado = estado;

    const mesas = await prisma.mesa.findMany({
      where,
      include: {
        sector: true,
        pedidos: {
          where: { estado: { in: ["recibido", "aceptado", "en_preparacion", "listo", "entregado", "esperando_cuenta"] } },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ sector: { orden: "asc" } }, { numero: "asc" }],
    });

    return NextResponse.json({ data: mesas });
  } catch (error) {
    console.error("Error GET /api/mesas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/mesas — Crear mesa
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(MesaSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const { numero, capacidad, sectorId, posicionX, posicionY, activa } = validation.data;

    // Verificar que el sector existe y pertenece al tenant
    const sector = await prisma.sector.findFirst({
      where: { id: sectorId, tenantId: context.tenantId },
    });

    if (!sector) {
      return NextResponse.json({ error: "Sector no encontrado" }, { status: 404 });
    }

    // Verificar número único en la sucursal
    const existing = await prisma.mesa.findFirst({
      where: {
        tenantId: context.tenantId,
        sucursalId: sector.sucursalId,
        numero,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe una mesa con ese número en esta sucursal" }, { status: 409 });
    }

    const mesa = await prisma.mesa.create({
      data: {
        tenantId: context.tenantId,
        sucursalId: sector.sucursalId,
        sectorId,
        numero,
        capacidad,
        posicionX,
        posicionY,
        activa,
        estado: "libre",
      },
      include: { sector: true },
    });

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Mesa",
        entidadId: mesa.id,
        valorNuevo: mesa as any,
      },
    });

    return NextResponse.json({ success: true, mesa }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/mesas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}