import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/dashboard/resumen
// ============================================
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tenantId = ctx.tenantId;
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioAyer = new Date(inicioHoy);
  inicioAyer.setDate(inicioAyer.getDate() - 1);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [
    pagosHoy,
    pagosAyer,
    pagosMes,
    mesas,
    pedidosActivos,
    productos,
    clientes,
    stock,
  ] = await Promise.all([
    prisma.pago.findMany({
      where: { tenantId, createdAt: { gte: inicioHoy } },
      select: { monto: true },
    }),
    prisma.pago.findMany({
      where: { tenantId, createdAt: { gte: inicioAyer, lt: inicioHoy } },
      select: { monto: true },
    }),
    prisma.pago.findMany({
      where: { tenantId, createdAt: { gte: inicioMes } },
      select: { monto: true },
    }),
    prisma.mesa.findMany({ where: { tenantId }, select: { estado: true } }),
    prisma.pedido.count({
      where: {
        tenantId,
        estado: { notIn: ["pagado", "cerrado", "cancelado", "anulado"] },
      },
    }),
    prisma.producto.count({ where: { tenantId } }),
    prisma.cliente.count({ where: { tenantId } }),
    prisma.stockPorSucursal.findMany({
      where: { tenantId, sucursalId: ctx.sucursalId ?? undefined },
      include: { ingrediente: true },
    }),
  ]);

  const sum = (arr: { monto: number }[]) =>
    Math.round(arr.reduce((s, p) => s + Number(p.monto), 0));

  const ventasHoy = sum(pagosHoy);
  const ventasAyer = sum(pagosAyer);
  const ventasMes = sum(pagosMes);
  const mesasOcupadas = mesas.filter(
    (m) => !["libre", "reservada", "limpieza"].includes(m.estado)
  ).length;
  const stockCritico = stock.filter((s) => {
    const min = Number(s.ingrediente.stockMinimo || 0);
    return min > 0 && Number(s.cantidadActual) <= min * 0.5;
  }).length;

  return NextResponse.json({
    ventasHoy,
    ventasAyer,
    ticketPromedio: pedidosActivos > 0 ? Math.round(ventasHoy / pedidosActivos) : 0,
    mesasOcupadas,
    mesasTotales: mesas.length,
    pedidosActivos,
    clientesHoy: clientes,
    stockCritico,
    productos,
    clientes,
    ventasMes,
  });
}
