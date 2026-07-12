import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/operativo/alertas — Alertas activas (semáforo de pase)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;

    const pedidos = await prisma.pedido.findMany({
      where: {
        tenantId: context.tenantId,
        ...(sucursalId ? { sucursalId } : {}),
        estado: { in: ["recibido", "aceptado", "en_preparacion", "listo"] },
      },
      include: {
        mesa: { select: { numero: true } },
        items: {
          where: { anulado: false, horaEntregado: null, OR: [{ horaListo: { not: null } }, { estado: { in: ["en_preparacion", "listo"] } }] },
          include: { producto: { select: { nombre: true, estacion: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const ahora = Date.now();
    const alertas = pedidos.flatMap((p) =>
      p.items.map((it) => {
        const minutos = it.horaListo ? Math.floor((ahora - new Date(it.horaListo).getTime()) / 60000) : 0;
        let color = "verde";
        if (it.horaListo) {
          color = minutos > 10 ? "rojo" : minutos >= 5 ? "amarillo" : "verde";
        }
        return {
          pedidoId: p.id,
          itemId: it.id,
          mesa: p.mesa?.numero ?? "DELIVERY",
          producto: it.producto.nombre,
          estacion: it.producto.estacion,
          estado: it.estado,
          horaListo: it.horaListo,
          minutosEspera: it.horaListo ? minutos : null,
          color,
        };
      })
    );

    return NextResponse.json({ data: alertas, total: alertas.length });
  } catch (error) {
    console.error("Error GET /api/operativo/alertas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
