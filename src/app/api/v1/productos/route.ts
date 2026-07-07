import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// MIDDLEWARE DE API KEY
// ============================================

async function validarAPIKey(request: NextRequest): Promise<{ tenantId: string; scopes: string[] } | null> {
  const apiKey = request.headers.get("X-API-Key") || request.nextUrl.searchParams.get("api_key");

  if (!apiKey) return null;

  // En producción: buscar en tabla de api_keys
  // Por ahora: mock validation
  const apiKeys: Record<string, { tenantId: string; scopes: string[] }> = {
    "demo-key-123": {
      tenantId: "tenant-demo-001",
      scopes: ["productos:leer", "pedidos:crear", "pedidos:leer", "clientes:leer"],
    },
  };

  return apiKeys[apiKey] || null;
}

// ============================================
// GET /api/v1/productos — Listar productos (público)
// ============================================

export async function GET(request: NextRequest) {
  const auth = await validarAPIKey(request);

  if (!auth) {
    return NextResponse.json(
      { error: "API key requerida. Envía X-API-Key header o ?api_key=..." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria") || undefined;
    const disponible = searchParams.get("disponible") !== "false";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const where: Record<string, unknown> = {
      tenantId: auth.tenantId,
      ...(disponible !== undefined && { disponible }),
    };

    if (categoria) {
      where.categoria = { nombre: categoria };
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: { categoria: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nombre: "asc" },
      }),
      prisma.producto.count({ where }),
    ]);

    return NextResponse.json({
      data: productos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error API productos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
