import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/cocina/comandas/[id]/imprimir — Generar ticket de comanda
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    const pedido = await prisma.pedido.findFirst({
      where: { id, tenantId: context.tenantId },
      include: {
        mesa: { select: { numero: true, sector: { select: { nombre: true } } } },
        sucursal: { select: { nombre: true } },
        items: {
          where: { anulado: false },
          include: { producto: { select: { nombre: true, estacion: true } } },
        },
      },
    });
    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const lineas = pedido.items.map((i) => {
      const obs = i.notas ? `  (* ${i.notas})` : "";
      return `  ${i.cantidad}x ${i.producto.nombre}${i.producto.estacion ? ` [${i.producto.estacion}]` : ""}${obs}`;
    });

    const ticket = [
      "====== COMANDA ======",
      `Local:   ${pedido.sucursal.nombre}`,
      `Mesa:    ${pedido.mesa?.numero ?? "DELIVERY"} (${pedido.mesa?.sector.nombre ?? "-"})`,
      `Pedido:  ${pedido.id.slice(0, 8).toUpperCase()}`,
      `Hora:    ${new Date().toLocaleString("es-AR")}`,
      "----------------------",
      ...lineas,
      "======================",
    ].join("\n");

    await prisma.pedidoEvento.create({
      data: {
        tenantId: context.tenantId,
        pedidoId: id,
        evento: "IMPRESION_COMANDA",
        usuarioId: context.usuarioId,
        metadata: { copias: 1 } as any,
      },
    });

    return NextResponse.json({
      success: true,
      ticket,
      pedidoId: id,
      impresoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error POST /api/cocina/comandas/[id]/imprimir:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
