import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { ESTADOS_RESERVA, puedeTransicionarReserva } from "@/lib/reservas/estados";

// ============================================
// PATCH /api/reservas/[id] — cambiar estado / asignar mesa
// ============================================

const Schema = z.object({
  estado: z.enum(ESTADOS_RESERVA).optional(),
  mesaId: z.string().uuid().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 422 });
    }

    const reserva = await prisma.reserva.findFirst({
      where: { id, tenantId: ctx.tenantId },
      select: { id: true, estado: true },
    });
    if (!reserva) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

    const cambios: { estado?: string; mesaId?: string | null } = {};

    if (parsed.data.estado && parsed.data.estado !== reserva.estado) {
      if (!puedeTransicionarReserva(reserva.estado, parsed.data.estado)) {
        return NextResponse.json(
          { error: `No se puede pasar de "${reserva.estado}" a "${parsed.data.estado}".` },
          { status: 409 }
        );
      }
      cambios.estado = parsed.data.estado;
    }

    if (parsed.data.mesaId !== undefined) {
      if (parsed.data.mesaId) {
        const mesa = await prisma.mesa.findFirst({
          where: { id: parsed.data.mesaId, tenantId: ctx.tenantId },
          select: { id: true },
        });
        if (!mesa) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
      }
      cambios.mesaId = parsed.data.mesaId;
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const actualizada = await prisma.reserva.update({
      where: { id: reserva.id },
      data: cambios,
      include: { mesa: true, cliente: true },
    });

    return NextResponse.json({ data: actualizada });
  } catch (error) {
    console.error("Error PATCH /api/reservas/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
