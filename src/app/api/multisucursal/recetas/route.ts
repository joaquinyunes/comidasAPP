import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RecetaCentralizadaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/multisucursal/recetas — Catálogo centralizado del tenant
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const recetas = await prisma.receta.findMany({
      where: { tenantId: context.tenantId },
      include: {
        producto: { select: { id: true, nombre: true, precio: true } },
        recetaIngredientes: {
          include: { ingrediente: { select: { id: true, nombre: true, unidadMedida: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: recetas });
  } catch (error) {
    console.error("Error GET /api/multisucursal/recetas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================
// POST /api/multisucursal/recetas — Crear receta centralizada
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(RecetaCentralizadaSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const producto = await prisma.producto.findFirst({
      where: { id: validation.data.productoId, tenantId: context.tenantId },
    });
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const receta = await prisma.receta.create({
      data: {
        tenantId: context.tenantId,
        productoId: validation.data.productoId,
        nombre: validation.data.nombre ?? producto.nombre,
        porciones: validation.data.porciones,
        instrucciones: validation.data.instrucciones,
        recetaIngredientes: {
          create: validation.data.ingredientes.map((ing) => ({
            tenantId: context.tenantId,
            ingredienteId: ing.ingredienteId,
            cantidad: ing.cantidad,
            unidad: ing.unidad,
            opcional: ing.opcional,
          })),
        },
      },
      include: { recetaIngredientes: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "CREAR",
        entidad: "Receta",
        entidadId: receta.id,
        valorNuevo: receta as any,
      },
    });

    return NextResponse.json({ success: true, receta }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/multisucursal/recetas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
