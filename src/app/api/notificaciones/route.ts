import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/notificaciones — Enviar notificación
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, titulo, mensaje, canal, destinatario, metadatos } = body;

    // Validación
    if (!tipo || !titulo || !mensaje || !canal || !destinatario) {
      return NextResponse.json(
        { error: "tipo, titulo, mensaje, canal y destinatario son requeridos" },
        { status: 400 }
      );
    }

    const canalesValidos = ["push", "email", "whatsapp", "sms", "in_app"];
    if (!canalesValidos.includes(canal)) {
      return NextResponse.json(
        { error: `Canal inválido. Válidos: ${canalesValidos.join(", ")}` },
        { status: 400 }
      );
    }

    // En producción: guardar en DB y enviar por el canal correspondiente
    const notificacion = {
      id: crypto.randomUUID(),
      tipo,
      titulo,
      mensaje,
      canal,
      destinatario,
      metadatos,
      estado: "enviada",
      createdAt: new Date(),
    };

    // Simular envío
    console.log(`📤 Notificación enviada vía ${canal}:`, notificacion);

    return NextResponse.json({
      success: true,
      notificacion,
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/notificaciones — Listar notificaciones
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const tipo = searchParams.get("tipo");
    const soloNoLeidas = searchParams.get("noLeidas") === "true";

    const where: Record<string, unknown> = { tenantId: ctx.tenantId };
    if (userId) where.usuarioId = userId;
    if (tipo) where.tipo = tipo;
    if (soloNoLeidas) where.leida = false;

    const notificaciones = await prisma.notificacion.findMany({
      where,
      include: { usuario: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const data = notificaciones.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      leida: n.leida,
      estado: n.leida ? "leida" : "pendiente",
      usuario: n.usuario,
      metadata: n.metadata,
      createdAt: n.createdAt,
    }));

    return NextResponse.json({ notificaciones: data });
  } catch (error) {
    console.error("Error al listar notificaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/notificaciones — Marcar como leída
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificacionId, marcarTodas } = body;

    if (marcarTodas) {
      // Marcar todas como leídas
      console.log("Marcando todas las notificaciones como leídas");
    } else if (notificacionId) {
      // Marcar una específica
      console.log(`Marcando notificación ${notificacionId} como leída`);
    } else {
      return NextResponse.json(
        { error: "notificacionId o marcarTodas es requerido" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
