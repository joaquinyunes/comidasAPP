import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrdenCompraSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/compras/ordenes — Listar órdenes de compra
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const proveedorId = searchParams.get("proveedorId") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;
    if (proveedorId) where.proveedorId = proveedorId;
    if (estado) where.estado = estado;

    const [ordenes, total] = await Promise.all([
      prisma.ordenCompra.findMany({
        where,
        include: {
          proveedor: true,
          sucursal: true,
          items: { include: { ingrediente: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ordenCompra.count({ where }),
    ]);

    return NextResponse.json({
      data: ordenes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/compras/ordenes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/compras/ordenes — Crear orden de compra
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(OrdenCompraSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const { proveedorId, sucursalId, items, notas } = validation.data;

    // Verificar proveedor y sucursal
    const [proveedor, sucursal] = await Promise.all([
      prisma.proveedor.findFirst({ where: { id: proveedorId, tenantId: context.tenantId } }),
      prisma.sucursal.findFirst({ where: { id: sucursalId, tenantId: context.tenantId } }),
    ]);

    if (!proveedor || !sucursal) {
      return NextResponse.json({ error: "Proveedor o sucursal no encontrados" }, { status: 404 });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

    // Crear orden
    const orden = await prisma.ordenCompra.create({
      data: {
        tenantId: context.tenantId,
        proveedorId,
        sucursalId,
        estado: "borrador",
        total,
        notas,
        usuarioId: context.usuarioId,
        items: {
          create: items.map((item) => ({
            tenantId: context.tenantId,
            ingredienteId: item.ingredienteId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          })),
        },
      },
      include: { items: { include: { ingrediente: true } }, proveedor: true, sucursal: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "OrdenCompra",
        entidadId: orden.id,
        valorNuevo: orden as any,
      },
    });

    return NextResponse.json({ success: true, orden }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/compras/ordenes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}