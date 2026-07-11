import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfflineSyncSchema, validateInput } from "@/lib/validation";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/friccion/sync — Vaciar cola offline (LAN local)
// ============================================
export async function POST(request: NextRequest) {
  const context = await getTenantContext(request);
  if (!context) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const validation = validateInput(OfflineSyncSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: "Cola inválida", details: validation.errors }, { status: 400 });
  }

  const resultados = [];
  for (const item of validation.data.items) {
    try {
      // Solo procesamos anulaciones en diferido (operación offline crítica)
      const match = item.ruta.match(/^\/api\/pedidos\/([^/]+)\/items\/([^/]+)\/anular$/);
      if (item.metodo === "POST" && match) {
        const [, pedidoId, itemId] = match;
        const pedidoItem = await prisma.pedidoItem.findFirst({
          where: { id: itemId, pedidoId, tenantId: context.tenantId },
        });
        if (!pedidoItem) {
          resultados.push({ clientId: item.clientId, status: "error", mensaje: "Ítem no encontrado" });
          continue;
        }
        if (pedidoItem.anulado) {
          resultados.push({ clientId: item.clientId, status: "omitido", mensaje: "Ya anulado" });
          continue;
        }
        const motivo = (item.payload as Record<string, unknown>)?.motivo ?? "Offline";
        await prisma.anulacion.create({
          data: {
            tenantId: context.tenantId,
            pedidoItemId: itemId,
            usuarioId: context.usuarioId,
            motivo: String(motivo),
          },
        });
        await prisma.pedidoItem.update({
          where: { id: itemId },
          data: { anulado: true, motivoAnulacion: String(motivo) },
        });
        resultados.push({ clientId: item.clientId, status: "ok" });
      } else {
        resultados.push({ clientId: item.clientId, status: "omitido", mensaje: "Ruta no soportada en diferido" });
      }
    } catch (err) {
      resultados.push({ clientId: item.clientId, status: "error", mensaje: (err as Error).message });
    }
  }

  const aplicados = resultados.filter((r) => r.status === "ok").length;
  return NextResponse.json({ success: true, aplicados, total: resultados.length, resultados });
}
