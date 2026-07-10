import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProveedorSchema, OrdenCompraSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/compras/proveedores — Listar proveedores
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activo = searchParams.get("activo") !== "false";
    const busqueda = searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId, activo };
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: "insensitive" } },
        { contactoEmail: { contains: busqueda, mode: "insensitive" } },
      ];
    }

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        include: {
          _count: { select: { ordenesCompra: true, productoProveedor: true } },
        },
        orderBy: { nombre: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.proveedor.count({ where }),
    ]);

    return NextResponse.json({
      data: proveedores,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/compras/proveedores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/compras/proveedores — Crear proveedor
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(ProveedorSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        tenantId: context.tenantId,
        ...validation.data,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Proveedor",
        entidadId: proveedor.id,
        valorNuevo: proveedor as any,
      },
    });

    return NextResponse.json({ success: true, proveedor }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/compras/proveedores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}