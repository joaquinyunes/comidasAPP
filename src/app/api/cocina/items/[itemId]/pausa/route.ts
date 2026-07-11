export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

export async function POST(req: NextRequest, { params }: { params: { itemId: string } }) {
  const ctx = await getTenantContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const item = await prisma.pedidoItem.findFirst({
    where: { id: params.itemId, tenantId: ctx.tenantId },
  });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const nuevoEstado = item.estado === "en_pausa" ? "en_preparacion" : "en_pausa";
  const actualizado = await prisma.pedidoItem.update({
    where: { id: item.id },
    data: { estado: nuevoEstado },
  });

  return NextResponse.json({ data: { id: actualizado.id, estado: actualizado.estado, pausado: actualizado.estado === "en_pausa" } });
}
