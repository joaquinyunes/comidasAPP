import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================
// SCHEMA DE VALIDACIÓN
// ============================================

const CrearPedidoSchema = z.object({
  mesaId: z.string().uuid(),
  items: z.array(z.object({
    productoId: z.string().uuid(),
    cantidad: z.number().int().positive(),
    notas: z.string().max(200).optional(),
  })).min(1),
  notas: z.string().max(500).optional(),
});

// ============================================
// MIDDLEWARE DE API KEY
// ============================================

async function validarAPIKey(request: NextRequest): Promise<{ tenantId: string; scopes: string[] } | null> {
  const apiKey = request.headers.get("X-API-Key") || request.nextUrl.searchParams.get("api_key");
  if (!apiKey) return null;

  const apiKeys: Record<string, { tenantId: string; scopes: string[] }> = {
    "demo-key-123": {
      tenantId: "tenant-demo-001",
      scopes: ["productos:leer", "pedidos:crear", "pedidos:leer", "clientes:leer"],
    },
  };

  return apiKeys[apiKey] || null;
}

// ============================================
// POST /api/v1/pedidos — Crear pedido
// ============================================

export async function POST(request: NextRequest) {
  const auth = await validarAPIKey(request);

  if (!auth) {
    return NextResponse.json(
      { error: "API key requerida" },
      { status: 401 }
    );
  }

  if (!auth.scopes.includes("pedidos:crear")) {
    return NextResponse.json(
      { error: "No tienes permiso para crear pedidos" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validation = CrearPedidoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { mesaId, items, notas } = validation.data;

    // Verificar que la mesa existe
    const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    // Calcular total
    const productos = await prisma.producto.findMany({
      where: { id: { in: items.map((i) => i.productoId) } },
    });

    const total = items.reduce((sum, item) => {
      const prod = productos.find((p) => p.id === item.productoId);
      return sum + (prod ? Number(prod.precio) * item.cantidad : 0);
    }, 0);

    // Crear pedido
    const pedido = await prisma.pedido.create({
      data: {
        tenantId: auth.tenantId,
        sucursalId: mesa.sucursalId,
        mesaId,
        estado: "recibido",
        tipo: "mesa",
        total,
        notas,
        items: {
          create: items.map((item) => {
            const prod = productos.find((p) => p.id === item.productoId);
            return {
              tenantId: auth.tenantId,
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: prod ? Number(prod.precio) : 0,
              subtotal: prod ? Number(prod.precio) * item.cantidad : 0,
              notas: item.notas,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Actualizar estado de la mesa
    await prisma.mesa.update({
      where: { id: mesaId },
      data: { estado: "esperando_pedido" },
    });

    return NextResponse.json({
      success: true,
      pedido: {
        id: pedido.id,
        estado: pedido.estado,
        total: pedido.total,
        items: pedido.items.length,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error API crear pedido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/v1/pedidos — Listar pedidos
// ============================================

export async function GET(request: NextRequest) {
  const auth = await validarAPIKey(request);

  if (!auth) {
    return NextResponse.json({ error: "API key requerida" }, { status: 401 });
  }

  if (!auth.scopes.includes("pedidos:leer")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = { tenantId: auth.tenantId };
    if (estado) where.estado = estado;

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: { items: true, mesa: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pedido.count({ where }),
    ]);

    return NextResponse.json({
      data: pedidos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error API pedidos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
