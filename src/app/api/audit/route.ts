import { NextRequest, NextResponse } from "next/server";
import { AuditService } from "@/lib/audit";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/audit — Consultar logs de auditoría
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = ctx.tenantId;
    const entidad = searchParams.get("entidad") || undefined;
    const usuarioId = searchParams.get("usuarioId") || undefined;
    const accion = searchParams.get("accion") as "create" | "update" | "delete" | "login" | "logout" | "export" | "config_change" | undefined;
    const desde = searchParams.get("desde") || undefined;
    const hasta = searchParams.get("hasta") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const logs = await AuditService.query({
      tenantId,
      entidad,
      usuarioId,
      accion,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ logs, total: logs.length });
  } catch (error) {
    console.error("Error al consultar auditoría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/audit — Registrar evento manual
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, usuarioId, accion, entidad, entidadId, valorAnterior, valorNuevo } = body;

    if (!tenantId || !accion || !entidad) {
      return NextResponse.json(
        { error: "tenantId, accion y entidad son requeridos" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    await AuditService.log({
      tenantId,
      usuarioId,
      accion,
      entidad,
      entidadId,
      valorAnterior,
      valorNuevo,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
