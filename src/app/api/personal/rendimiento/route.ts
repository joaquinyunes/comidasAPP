import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/personal/rendimiento — Cruce turno/ventas/tiempos
// ============================================
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const empleadoId = searchParams.get("empleadoId") || undefined;
    const sucursalId = searchParams.get("sucursalId") || context.sucursalId || undefined;
    const desde = searchParams.get("desde") || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10);
    const hasta = searchParams.get("hasta") || new Date().toISOString().slice(0, 10);
    const hastaDt = new Date(`${hasta}T23:59:59Z`);

    const whereEmpleado: Record<string, unknown> = { tenantId: context.tenantId };
    if (empleadoId) whereEmpleado.id = empleadoId;
    if (sucursalId) whereEmpleado.sucursalId = sucursalId;

    const empleados = await prisma.empleado.findMany({
      where: whereEmpleado,
      include: {
        usuario: { select: { id: true, nombre: true } },
        asistencia: {
          where: { entrada: { gte: new Date(desde), lte: hastaDt } },
        },
        turnos: {
          where: { fecha: { gte: new Date(desde), lte: new Date(hasta) } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const rendimiento = await Promise.all(
      empleados.map(async (e) => {
        const horasTrabajadas = e.asistencia.reduce(
          (acc, a) => acc + (a.horasTrabajadas ? Number(a.horasTrabajadas) : 0),
          0
        );

        const pedidos = await prisma.pedido.findMany({
          where: {
            mozoId: e.usuarioId,
            ...(sucursalId ? { sucursalId } : {}),
            createdAt: { gte: new Date(desde), lte: hastaDt },
          },
          select: {
            id: true,
            total: true,
            items: { select: { horaEnviado: true, horaListo: true } },
          },
        });

        const ventas = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
        const tiempos = pedidos.flatMap((p) =>
          p.items
            .filter((i) => i.horaEnviado && i.horaListo)
            .map((i) => new Date(i.horaListo!).getTime() - new Date(i.horaEnviado!).getTime())
        );
        const tiempoPromedioMin =
          tiempos.length > 0
            ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length / 60000)
            : null;

        return {
          empleadoId: e.id,
          nombre: e.usuario.nombre,
          cargo: e.cargo,
          turnos: e.turnos.length,
          horasTrabajadas: Math.round(horasTrabajadas * 100) / 100,
          pedidosAtendidos: pedidos.length,
          ventasTotales: Math.round(ventas * 100) / 100,
          ventasPorHora: horasTrabajadas > 0 ? Math.round((ventas / horasTrabajadas) * 100) / 100 : 0,
          tiempoPromedioPreparacionMin: tiempoPromedioMin,
        };
      })
    );

    return NextResponse.json({
      data: rendimiento,
      periodo: { desde, hasta, sucursalId },
    });
  } catch (error) {
    console.error("Error GET /api/personal/rendimiento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
