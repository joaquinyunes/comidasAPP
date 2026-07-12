import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/operativo/comandas-estructuradas — Vista de cocina por estación
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const estacion = searchParams.get("estacion") || undefined;

    const pedidos = await prisma.pedido.findMany({
      where: {
        tenantId: context.tenantId,
        ...(sucursalId ? { sucursalId } : {}),
        estado: { in: ["recibido", "aceptado", "en_preparacion", "listo"] },
      },
      include: {
        mesa: { select: { numero: true } },
        items: {
          where: { anulado: false, estado: { in: ["recibido", "aceptado", "en_preparacion", "listo"] } },
          include: { producto: { select: { nombre: true, estacion: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar ítems por estación
    const porEstacion: Record<string, any[]> = {};
    for (const p of pedidos) {
      for (const it of p.items) {
        const est = it.producto.estacion || "SIN_ESTACION";
        if (estacion && est !== estacion) continue;
        porEstacion[est] = porEstacion[est] ?? [];
        porEstacion[est].push({
          pedidoId: p.id,
          mesa: p.mesa?.numero ?? "DELIVERY",
          producto: it.producto.nombre,
          cantidad: it.cantidad,
          estado: it.estado,
          notas: it.notas,
          horaEnviado: it.horaEnviado,
        });
      }
    }

    return NextResponse.json({ data: porEstacion, estaciones: Object.keys(porEstacion) });
  } catch (error) {
    console.error("Error GET /api/operativo/comandas-estructuradas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
