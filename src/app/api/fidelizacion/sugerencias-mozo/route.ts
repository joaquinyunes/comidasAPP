import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/fidelizacion/sugerencias-mozo — Sugerencias en el momento
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId");

    if (!clienteId) {
      return NextResponse.json({ error: "clienteId es requerido" }, { status: 400 });
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, tenantId: context.tenantId },
      include: { favoritos: { include: { producto: { select: { id: true, nombre: true, precio: true } } } } },
    });
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const pedidos = await prisma.pedido.findMany({
      where: { clienteId, tenantId: context.tenantId },
      include: { items: { include: { producto: { select: { id: true, nombre: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const conteo: Record<string, { nombre: string; cantidad: number }> = {};
    for (const p of pedidos) {
      for (const it of p.items) {
        if (!it.anulado && it.producto) {
          conteo[it.producto.id] = conteo[it.producto.id] ?? { nombre: it.producto.nombre, cantidad: 0 };
          conteo[it.producto.id].cantidad += it.cantidad;
        }
      }
    }
    const suelePedir = Object.entries(conteo)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 5)
      .map(([productoId, v]) => ({ productoId, ...v }));

    return NextResponse.json({
      data: {
        cliente: { id: cliente.id, nombre: cliente.nombre, nivel: cliente.nivel, puntos: cliente.puntos, totalVisitas: cliente.totalVisitas },
        favoritos: cliente.favoritos.map((f) => f.producto),
        suelePedir,
        alergias: cliente.alergias,
        preferencias: cliente.preferencias,
      },
    });
  } catch (error) {
    console.error("Error GET /api/fidelizacion/sugerencias-mozo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
