export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

const Schema = z.object({ estado: z.enum(["asignado", "en_camino", "entregado", "fallido"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Estado inválido" }, { status: 422 });

  const asignacion = await prisma.asignacionReparto.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!asignacion) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const data: any = { estado: parsed.data.estado };
  if (parsed.data.estado === "en_camino") data.horaSalida = new Date();
  if (parsed.data.estado === "entregado") data.horaEntrega = new Date();

  const actualizada = await prisma.asignacionReparto.update({ where: { id: asignacion.id }, data });
  if (parsed.data.estado === "entregado") {
    await prisma.pedido.update({ where: { id: asignacion.pedidoId }, data: { estado: "entregado" } });
  }

  return NextResponse.json({ data: actualizada });
}
