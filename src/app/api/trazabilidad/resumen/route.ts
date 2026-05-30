export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [anulaciones, eventos] = await Promise.all([
    prisma.anulacion.findMany({
      where: { tenantId: ctx.tenantId },
      include: { pedidoItem: { select: { producto: { select: { nombre: true } }, cantidad: true } }, usuario: { select: { nombre: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.pedidoEvento.findMany({
      where: { tenantId: ctx.tenantId },
      include: { usuario: { select: { nombre: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const porUsuario: Record<string, { anulaciones: number; eventos: number }> = {};
  const sumar = (u: string | null, tipo: "anulaciones" | "eventos") => {
    const k = u ?? "sistema";
    porUsuario[k] = porUsuario[k] ?? { anulaciones: 0, eventos: 0 };
    porUsuario[k][tipo] += 1;
  };
  anulaciones.forEach((a) => sumar(a.usuario?.nombre ?? null, "anulaciones"));
  eventos.forEach((e) => sumar(e.usuario?.nombre ?? null, "eventos"));

  return NextResponse.json({
    data: {
      anulaciones: anulaciones.map((a) => ({
        id: a.id,
        producto: a.pedidoItem.producto.nombre,
        cantidad: a.pedidoItem.cantidad,
        motivo: a.motivo,
        usuario: a.usuario?.nombre ?? "—",
        fecha: a.createdAt,
      })),
      eventos: eventos.map((e) => ({ id: e.id, evento: e.evento, usuario: e.usuario?.nombre ?? "—", fecha: e.createdAt })),
      porUsuario,
    },
  });
}
