import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IngredienteSchema, StockPorSucursalSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/inventario/ingredientes — Listar ingredientes
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const activo = searchParams.get("activo") !== "false";
    const busqueda = searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const where: Record<string, unknown> = { tenantId: context.tenantId, activo };
    if (busqueda) {
      where.nombre = { contains: busqueda, mode: "insensitive" };
    }

    const [ingredientes, total] = await Promise.all([
      prisma.ingrediente.findMany({
        where,
        include: {
          stockPorSucursal: sucursalId ? { where: { sucursalId } } : true,
          proveedorProducto: { include: { proveedor: true } },
        },
        orderBy: { nombre: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ingrediente.count({ where }),
    ]);

    // Calcular estado de stock para cada ingrediente
    const conEstado = ingredientes.map((ing) => {
      const stockTotal = ing.stockPorSucursal.reduce((sum, s) => sum + Number(s.cantidadActual), 0);
      const stockReservado = ing.stockPorSucursal.reduce((sum, s) => sum + Number(s.cantidadReservada), 0);
      const disponible = stockTotal - stockReservado;

      let estado: "ok" | "bajo" | "critico" = "ok";
      if (ing.stockMinimo && disponible <= Number(ing.stockMinimo) * 0.5) estado = "critico";
      else if (ing.stockMinimo && disponible <= Number(ing.stockMinimo)) estado = "bajo";

      return {
        ...ing,
        stockTotal,
        stockReservado,
        disponible,
        estado,
      };
    });

    return NextResponse.json({
      data: conEstado,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/inventario/ingredientes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/inventario/ingredientes — Crear ingrediente
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(IngredienteSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const ingrediente = await prisma.ingrediente.create({
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
        entidad: "Ingrediente",
        entidadId: ingrediente.id,
        valorNuevo: ingrediente as any,
      },
    });

    return NextResponse.json({ success: true, ingrediente }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/inventario/ingredientes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}