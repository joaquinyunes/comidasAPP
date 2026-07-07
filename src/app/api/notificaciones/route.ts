import { NextRequest, NextResponse } from "next/server";

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const tipo = searchParams.get("tipo");
    const soloNoLeidas = searchParams.get("noLeidas") === "true";

    // En producción: query a DB
    const notificaciones = [
      {
        id: "1",
        tipo: "pedido",
        titulo: "Nuevo pedido #1234",
        mensaje: "Mesa 5 realizó un pedido de $45.000",
        canal: "in_app",
        estado: "leida",
        createdAt: new Date(),
      },
      {
        id: "2",
        tipo: "stock",
        titulo: "Stock bajo: Muzzarella",
        mensaje: "Quedan 2kg de muzzarella",
        canal: "in_app",
        estado: "pendiente",
        createdAt: new Date(),
      },
    ];

    const filtradas = notificaciones.filter((n) => {
      if (tipo && n.tipo !== tipo) return false;
      if (soloNoLeidas && n.estado === "leida") return false;
      return true;
    });

    return NextResponse.json({ notificaciones: filtradas });
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
