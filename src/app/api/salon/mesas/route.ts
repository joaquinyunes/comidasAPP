export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { ordenarMesas } from "@/lib/salon/ordenar-mesas";

// ============================================
// GET /api/salon/mesas — el salón de un vistazo
//
// Una sola lectura con todo lo que el mozo necesita: cada mesa,
// su sector, sus comandas abiertas y cuántos platos esperan ser
// llevados. Evita pedir mesa por mesa.
// ============================================

const PEDIDO_ABIERTO = ["recibido", "en_preparacion", "listo", "entregado"];

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const mesas = await prisma.mesa.findMany({
      where: {
        tenantId: ctx.tenantId,
        activa: true,
        ...(ctx.sucursalId ? { sucursalId: ctx.sucursalId } : {}),
      },
      select: {
        id: true,
        numero: true,
        capacidad: true,
        estado: true,
        updatedAt: true,
        sector: { select: { nombre: true, orden: true } },
        pedidos: {
          where: { estado: { in: PEDIDO_ABIERTO } },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            estado: true,
            total: true,
            createdAt: true,
            items: {
              where: { anulado: false },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                cantidad: true,
                estado: true,
                notas: true,
                urgente: true,
                producto: { select: { nombre: true } },
              },
            },
          },
        },
      },
    });

    const ahora = Date.now();
    const data = mesas.map((m) => {
      const pedidos = m.pedidos.map((p) => ({
        id: p.id,
        estado: p.estado,
        total: Number(p.total),
        creadoEn: p.createdAt,
        items: p.items.map((i) => ({
          id: i.id,
          nombre: i.producto.nombre,
          cantidad: i.cantidad,
          estado: i.estado,
          notas: i.notas,
          urgente: i.urgente,
        })),
      }));
      return {
        id: m.id,
        numero: m.numero,
        capacidad: m.capacidad,
        estado: m.estado,
        sector: m.sector?.nombre ?? "Sin sector",
        ordenSector: m.sector?.orden ?? 999,
        segundosDesdeCambio: Math.max(0, Math.floor((ahora - m.updatedAt.getTime()) / 1000)),
        totalAbierto: pedidos.reduce((s, p) => s + p.total, 0),
        platosListos: pedidos.reduce((s, p) => s + p.items.filter((i) => i.estado === "listo").length, 0),
        pedidos,
      };
    });

    return NextResponse.json({ data: ordenarMesas(data) });
  } catch (error) {
    console.error("Error GET /api/salon/mesas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
