import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StockPorSucursalSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/inventario/movimientos — Registrar movimiento de stock
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { sucursalId, ingredienteId, tipo, cantidad, motivo, pedidoId, lote, fechaVencimiento } = body;

    // Validaciones
    if (!sucursalId || !ingredienteId || !tipo || !cantidad) {
      return NextResponse.json(
        { error: "sucursalId, ingredienteId, tipo y cantidad son requeridos" },
        { status: 400 }
      );
    }

    const tiposValidos = ["entrada", "salida", "ajuste", "merma", "transferencia_entrada", "transferencia_salida"];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json({ error: "Tipo de movimiento inválido" }, { status: 400 });
    }

    // Verificar ingrediente y sucursal
    const [ingrediente, sucursal] = await Promise.all([
      prisma.ingrediente.findFirst({ where: { id: ingredienteId, tenantId: context.tenantId } }),
      prisma.sucursal.findFirst({ where: { id: sucursalId, tenantId: context.tenantId } }),
    ]);

    if (!ingrediente || !sucursal) {
      return NextResponse.json({ error: "Ingrediente o sucursal no encontrados" }, { status: 404 });
    }

    // Obtener o crear stock por sucursal
    let stock = await prisma.stockPorSucursal.findFirst({
      where: {
        sucursalId,
        ingredienteId,
        lote: lote || "SIN_LOTE",
      },
    });

    if (!stock) {
      stock = await prisma.stockPorSucursal.create({
        data: {
          tenantId: context.tenantId,
          sucursalId,
          ingredienteId,
          cantidadActual: 0,
          cantidadReservada: 0,
          lote: lote || "SIN_LOTE",
          fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        },
      });
    }

    const cantidadDecimal = Number(cantidad);
    let nuevaCantidad = Number(stock.cantidadActual);

    // Calcular nueva cantidad según tipo
    if (["entrada", "transferencia_entrada", "ajuste"].includes(tipo)) {
      nuevaCantidad += cantidadDecimal;
    } else if (["salida", "merma", "transferencia_salida"].includes(tipo)) {
      if (nuevaCantidad < cantidadDecimal) {
        return NextResponse.json(
          { error: "Stock insuficiente", disponible: nuevaCantidad, requerido: cantidadDecimal },
          { status: 409 }
        );
      }
      nuevaCantidad -= cantidadDecimal;
    }

    // Transacción: actualizar stock + crear movimiento
    const [updatedStock, movimiento] = await prisma.$transaction([
      prisma.stockPorSucursal.update({
        where: { id: stock.id },
        data: { cantidadActual: nuevaCantidad },
      }),
      prisma.stockMovimiento.create({
        data: {
          tenantId: context.tenantId,
          sucursalId,
          ingredienteId,
          tipo,
          cantidad: cantidadDecimal,
          motivo,
          pedidoId,
          usuarioId: context.usuarioId,
        },
      }),
    ]);

    // Alerta si stock bajo
    if (ingrediente.stockMinimo && nuevaCantidad <= Number(ingrediente.stockMinimo)) {
      await prisma.notificacion.create({
        data: {
          tenantId: context.tenantId,
          tipo: "stock_bajo",
          titulo: "Stock bajo",
          mensaje: `${ingrediente.nombre} tiene ${nuevaCantidad} ${ingrediente.unidadMedida} (mín: ${ingrediente.stockMinimo})`,
          leida: false,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "MOVIMIENTO_STOCK",
        entidad: "StockMovimiento",
        entidadId: movimiento.id,
        valorNuevo: { ...movimiento, cantidadAnterior: stock.cantidadActual, cantidadNueva: nuevaCantidad } as any,
      },
    });

    return NextResponse.json({ success: true, stock: updatedStock, movimiento }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/inventario/movimientos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// GET /api/inventario/movimientos — Historial de movimientos
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const ingredienteId = searchParams.get("ingredienteId") || undefined;
    const tipo = searchParams.get("tipo") || undefined;
    const desde = searchParams.get("desde") || undefined;
    const hasta = searchParams.get("hasta") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (sucursalId) where.sucursalId = sucursalId;
    if (ingredienteId) where.ingredienteId = ingredienteId;
    if (tipo) where.tipo = tipo;
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) (where.createdAt as Record<string, Date>).gte = new Date(desde);
      if (hasta) (where.createdAt as Record<string, Date>).lte = new Date(hasta);
    }

    const [movimientos, total] = await Promise.all([
      prisma.stockMovimiento.findMany({
        where,
        include: {
          ingrediente: { select: { nombre: true, unidadMedida: true } },
          sucursal: { select: { nombre: true } },
          usuario: { select: { nombre: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockMovimiento.count({ where }),
    ]);

    return NextResponse.json({
      data: movimientos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error GET /api/inventario/movimientos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}