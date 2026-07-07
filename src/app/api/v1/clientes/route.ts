import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// MIDDLEWARE DE API KEY
// ============================================

async function validarAPIKey(request: NextRequest): Promise<{ tenantId: string; scopes: string[] } | null> {
  const apiKey = request.headers.get("X-API-Key") || request.nextUrl.searchParams.get("api_key");
  if (!apiKey) return null;

  const apiKeys: Record<string, { tenantId: string; scopes: string[] }> = {
    "demo-key-123": {
      tenantId: "tenant-demo-001",
      scopes: ["productos:leer", "pedidos:crear", "pedidos:leer", "clientes:leer", "clientes:crear"],
    },
  };

  return apiKeys[apiKey] || null;
}

// ============================================
// GET /api/v1/clientes — Listar clientes
// ============================================

export async function GET(request: NextRequest) {
  const auth = await validarAPIKey(request);

  if (!auth) {
    return NextResponse.json({ error: "API key requerida" }, { status: 401 });
  }

  if (!auth.scopes.includes("clientes:leer")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get("q") || undefined;
    const nivel = searchParams.get("nivel") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const where: Record<string, unknown> = { tenantId: auth.tenantId };
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: "insensitive" } },
        { email: { contains: busqueda, mode: "insensitive" } },
      ];
    }
    if (nivel) where.nivel = nivel;

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        orderBy: { totalGastado: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cliente.count({ where }),
    ]);

    return NextResponse.json({
      data: clientes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error API clientes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ============================================
// POST /api/v1/clientes — Crear cliente
// ============================================

export async function POST(request: NextRequest) {
  const auth = await validarAPIKey(request);

  if (!auth) {
    return NextResponse.json({ error: "API key requerida" }, { status: 401 });
  }

  if (!auth.scopes.includes("clientes:crear")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { nombre, email, telefono } = body;

    if (!nombre) {
      return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: {
        tenantId: auth.tenantId,
        nombre,
        email,
        telefono,
        puntos: 100, // Bonus de bienvenida
      },
    });

    return NextResponse.json({
      success: true,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        puntos: cliente.puntos,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error API crear cliente:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
