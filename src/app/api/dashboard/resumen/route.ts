import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermisoRuta } from "@/lib/auth/permiso-ruta";

// ============================================
// GET /api/dashboard/resumen
// ============================================
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tenantId = ctx.tenantId;
  // Las ventas y la cantidad de clientes son de quien ve reportes; el resto del personal ve lo operativo.
  const verFinanzas = tienePermisoRuta(ctx.permisos ?? [], "reportes:leer");
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
    verFinanzas ? prisma.pago.findMany({ where: { tenantId, estado: "completado", createdAt: { gte: inicioHoy } }, select: { monto: true } }) : Promise.resolve([]),
    verFinanzas ? prisma.pago.findMany({ where: { tenantId, estado: "completado", createdAt: { gte: inicioAyer, lt: inicioHoy } }, select: { monto: true } }) : Promise.resolve([]),
    verFinanzas ? prisma.pago.findMany({ where: { tenantId, estado: "completado", createdAt: { gte: inicioMes } }, select: { monto: true } }) : Promise.resolve([]),
    prisma.mesa.findMany({ where: { tenantId }, select: { estado: true } }),
    prisma.pedido.count({
      where: {
        tenantId,
        estado: { notIn: ["pagado", "cerrado", "cancelado", "anulado"] },
      },
    }),
    prisma.producto.count({ where: { tenantId } }),
    verFinanzas ? prisma.cliente.count({ where: { tenantId } }) : Promise.resolve(0),
    prisma.stockPorSucursal.findMany({
      where: { tenantId, sucursalId: ctx.sucursalId ?? undefined },
      include: { ingrediente: true },
    }),
  ]);

  const sum = (arr: { monto: unknown }[]) =>
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
    soloOperativo: !verFinanzas,
    ventasHoy,
    ventasAyer,
    // Ticket = lo cobrado dividido por la cantidad de cobros del día.
    ticketPromedio: pagosHoy.length > 0 ? Math.round(ventasHoy / pagosHoy.length) : 0,
    cobrosHoy: pagosHoy.length,
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
