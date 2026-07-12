import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/operativo/confirmacion-voz — Confirmar antes de enviar
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { pedidoId, itemId, texto } = body;
    if (!pedidoId) {
      return NextResponse.json({ error: "pedidoId es requerido" }, { status: 400 });
    }

    const evento = await prisma.pedidoEvento.create({
      data: {
        tenantId: context.tenantId,
        pedidoId,
        pedidoItemId: itemId ?? null,
        evento: "CONFIRMACION_VOZ",
        usuarioId: context.usuarioId,
        metadata: { texto: texto ?? null } as any,
      },
    });

    return NextResponse.json({ success: true, evento }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/operativo/confirmacion-voz:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
