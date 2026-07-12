import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReconocimientoSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/fidelizacion/reconocimiento — Vincular cliente a mesa por QR
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(ReconocimientoSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const mesa = await prisma.mesa.findFirst({
      where: { id: validation.data.mesaId, tenantId: context.tenantId },
    });
    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    // Abrir la visita vinculada al cliente (sin monto todavía)
    const visita = await prisma.visitaMesa.create({
      data: {
        tenantId: context.tenantId,
        clienteId: validation.data.clienteId,
        mesaId: validation.data.mesaId,
        sucursalId: mesa.sucursalId,
      },
    });

    const cliente = await prisma.cliente.findFirst({
      where: { id: validation.data.clienteId, tenantId: context.tenantId },
      include: {
        favoritos: { include: { producto: { select: { id: true, nombre: true } } } },
      },
    });

    // Sugerencias: favoritos + lo que más suele pedir este cliente
    const pedidosCliente = await prisma.pedido.findMany({
      where: { clienteId: validation.data.clienteId, tenantId: context.tenantId },
      include: { items: { include: { producto: { select: { id: true, nombre: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const conteo: Record<string, { nombre: string; cantidad: number }> = {};
    for (const p of pedidosCliente) {
      for (const it of p.items) {
        if (!it.anulado && it.producto) {
          conteo[it.producto.id] = conteo[it.producto.id] ?? { nombre: it.producto.nombre, cantidad: 0 };
          conteo[it.producto.id].cantidad += it.cantidad;
        }
      }
    }
    const sugerencias = Object.entries(conteo)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 5)
      .map(([productoId, v]) => ({ productoId, ...v }));

    return NextResponse.json(
      {
        success: true,
        visita,
        cliente: cliente
          ? {
              id: cliente.id,
              nombre: cliente.nombre,
              nivel: cliente.nivel,
              puntos: cliente.puntos,
              totalVisitas: cliente.totalVisitas,
              preferencias: cliente.preferencias,
              alergias: cliente.alergias,
              favoritos: cliente.favoritos.map((f) => f.producto),
            }
          : null,
        sugerencias,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /api/fidelizacion/reconocimiento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
