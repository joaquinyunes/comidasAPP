import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IngredienteSchema, StockMovimientoSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/inventario — Listar stock por sucursal
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId;
    const estado = searchParams.get("estado"); // "critico", "bajo", "ok"
    const busqueda = searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    if (!sucursalId) {
      return NextResponse.json({ error: "Se requiere sucursalId" }, { status: 400 });
    }

    // Verificar que la sucursal pertenece al tenant
    const sucursal = await prisma.sucursal.findFirst({
      where: { id: sucursalId, tenantId: context.tenantId },
    });
    if (!sucursal) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }

    // Obtener stock con info de ingredientes
    const whereStock: Record<string, unknown> = { sucursalId };
    if (busqueda) {
      whereStock.ingrediente = { nombre: { contains: busqueda, mode: "insensitive" } };
    }

    const stock = await prisma.stockPorSucursal.findMany({
      where: whereStock,
      include: {
        ingrediente: true,
      },
      orderBy: { ingrediente: { nombre: "asc" } },
    });

    // Calcular estado de cada item
    const stockConEstado = stock.map((item) => {
      const actual = Number(item.cantidadActual);
      const minimo = Number(item.ingrediente.stockMinimo || 0);
      const maximo = Number(item.ingrediente.stockMaximo || 0);
      let estadoCalculado: "ok" | "bajo" | "critico" = "ok";
      if (minimo > 0) {
        if (actual <= minimo * 0.5) estadoCalculado = "critico";
        else if (actual <= minimo) estadoCalculado = "bajo";
      }
      return {
        ...item,
        cantidadActual: actual,
        cantidadMinima: minimo,
        cantidadMaxima: maximo,
        estado: estadoCalculado,
        valorTotal: actual * Number(item.ingrediente.costoUnitario || 0),
      };
    });

    // Filtrar por estado si se especifica
    let filtrado = stockConEstado;
    if (estado) {
      filtrado = stockConEstado.filter((s) => s.estado === estado);
    }

    // Paginación
    const total = filtrado.length;
    const paginado = filtrado.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      data: paginado,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      resumen: {
        totalItems: stockConEstado.length,
        criticos: stockConEstado.filter((s) => s.estado === "critico").length,
        bajos: stockConEstado.filter((s) => s.estado === "bajo").length,
        valorTotal: stockConEstado.reduce((sum, s) => sum + s.valorTotal, 0),
      },
    });
  } catch (error) {
    console.error("Error GET /api/inventario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/inventario — Crear ingrediente + stock inicial
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { ingrediente, stockInicial } = body;

    const validation = validateInput(IngredienteSchema, ingrediente);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos de ingrediente inválidos", details: validation.errors }, { status: 400 });
    }

    const sucursalId = context.sucursalId || body.sucursalId;
    if (!sucursalId) {
      return NextResponse.json({ error: "Se requiere sucursalId" }, { status: 400 });
    }

    // Crear ingrediente
    const ingredienteCreado = await prisma.ingrediente.create({
      data: {
        tenantId: context.tenantId,
        ...validation.data,
        proveedorId: validation.data.proveedorId || null,
      },
    });

    // Crear stock inicial si se proporciona
    if (stockInicial && sucursalId) {
      await prisma.stockPorSucursal.upsert({
        where: {
          sucursalId_ingredienteId_lote: {
            sucursalId,
            ingredienteId: ingredienteCreado.id,
            lote: stockInicial.lote || "LOTE-DEFAULT",
          },
        },
        update: { cantidadActual: stockInicial.cantidad },
        create: {
          tenantId: context.tenantId,
          sucursalId,
          ingredienteId: ingredienteCreado.id,
          cantidadActual: stockInicial.cantidad,
          lote: stockInicial.lote || "LOTE-DEFAULT",
          fechaVencimiento: stockInicial.fechaVencimiento ? new Date(stockInicial.fechaVencimiento) : null,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Ingrediente",
        entidadId: ingredienteCreado.id,
        valorNuevo: ingredienteCreado as any,
      },
    });

    return NextResponse.json({ success: true, ingrediente: ingredienteCreado }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/inventario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}