import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VisitaMesaSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

function nivelPorPuntos(puntos: number): string {
  if (puntos >= 500) return "oro";
  if (puntos >= 200) return "plata";
  return "bronce";
}

// ============================================
// POST /api/fidelizacion/visitas — Registrar visita en mesa
// ============================================
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext(request);
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(VisitaMesaSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const mesa = await prisma.mesa.findFirst({
      where: { id: validation.data.mesaId, tenantId: context.tenantId },
    });
    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    const sucursalId = validation.data.sucursalId ?? mesa.sucursalId;

    const visita = await prisma.visitaMesa.create({
      data: {
        tenantId: context.tenantId,
        clienteId: validation.data.clienteId,
        mesaId: validation.data.mesaId,
        sucursalId,
        personas: validation.data.personas,
        monto: validation.data.monto,
      },
    });

    let cliente: any = null;
    if (validation.data.clienteId) {
      const actual = await prisma.cliente.findFirst({
        where: { id: validation.data.clienteId, tenantId: context.tenantId },
      });
      if (actual) {
        const nuevosPuntos = actual.puntos + Math.max(1, Math.round((validation.data.monto ?? 0) / 10));
        cliente = await prisma.cliente.update({
          where: { id: actual.id },
          data: {
            totalVisitas: actual.totalVisitas + 1,
            totalGastado: Number(actual.totalGastado) + (validation.data.monto ?? 0),
            ultimaVisita: new Date(),
            puntos: nuevosPuntos,
            nivel: nivelPorPuntos(nuevosPuntos),
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        usuarioId: context.usuarioId,
        accion: "REGISTRAR",
        entidad: "VisitaMesa",
        entidadId: visita.id,
        valorNuevo: validation.data as any,
      },
    });

    return NextResponse.json({ success: true, visita, cliente }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/fidelizacion/visitas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
