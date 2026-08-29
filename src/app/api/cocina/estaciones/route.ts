export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await prisma.pedidoItem.findMany({
    where: {
      anulado: false,
      estado: { in: ["recibido", "en_preparacion", "en_pausa"] },
      pedido: { tenantId: ctx.tenantId, estado: { in: ["recibido", "en_preparacion"] } },
    },
    include: {
      producto: { select: { nombre: true, estacion: true, tiempoPreparacionMin: true } },
      pedido: { select: { mesa: { select: { numero: true } } } },
    },
    orderBy: [{ urgente: "desc" }, { horaEnviado: "asc" }],
  });

  type ItemEstacion = {
    id: string;
    producto: string;
    mesa: string | null;
    estado: string;
    urgente: boolean;
    pausado: boolean;
    horaEnviado: Date | null;
    tiempoPreparacionMin: number | null;
  };
  const mapa: Record<string, ItemEstacion[]> = {};
  for (const it of items) {
    const estacion = it.producto.estacion || "sin_estacion";
    (mapa[estacion] ||= []).push({
      id: it.id,
      producto: it.producto.nombre,
      mesa: it.pedido.mesa?.numero ?? null,
      estado: it.estado,
      urgente: it.urgente,
      pausado: it.estado === "en_pausa",
      horaEnviado: it.horaEnviado,
      tiempoPreparacionMin: it.producto.tiempoPreparacionMin,
    });
  }

  const estaciones = Object.entries(mapa).map(([estacion, items]) => ({ estacion, items }));
  return NextResponse.json({ data: estaciones, ahora: new Date().toISOString() });
}
