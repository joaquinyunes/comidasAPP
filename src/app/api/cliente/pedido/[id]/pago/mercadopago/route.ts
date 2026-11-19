export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { montoPropina, totalConPropina, redondear2 } from "@/lib/pedidos/precio";
import { mpDisponible, crearPreferencia } from "@/lib/pagos/mercadopago";

// ============================================
// POST /api/cliente/pedido/[id]/pago/mercadopago
// Crea la preferencia y devuelve el link de pago.
// ============================================

const Schema = z.object({
  porcentajePropina: z.coerce.number().min(0).max(100).optional(),
});

// S3: por IP; frena el adivinado de códigos y el martilleo de cobros.
const limite = rateLimit({ maxRequests: 20, windowMs: 60_000, keyGenerator: (r) => "pago-mp:" + (r.headers.get("x-forwarded-for") ?? "?").split(",")[0].trim() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limitada = await limite(req);
  if (limitada) return limitada;

  if (!mpDisponible()) {
    return NextResponse.json({ error: "MercadoPago no está configurado." }, { status: 501 });
  }

  const { id } = await params;
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  const propinaPct = parsed.success ? parsed.data.porcentajePropina ?? 0 : 0;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
      total: true,
      mesa: { select: { numero: true } },
      pagos: { where: { estado: "completado" }, select: { monto: true, propina: true } },
    },
  });
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  if (pedido.estado === "pagado") {
    return NextResponse.json({ error: "El pedido ya está pagado." }, { status: 409 });
  }

  if (pedido.estado === "cancelado") {
    return NextResponse.json({ error: "El pedido fue cancelado." }, { status: 409 });
  }

  // Se cobra el SALDO pendiente (no el total): si ya hubo pagos parciales, no se pide dos veces lo mismo.
  const yaCobrado = pedido.pagos.reduce((a, p) => a + (Number(p.monto) - Number(p.propina)), 0);
  const base = redondear2(Math.max(0, Number(pedido.total) - yaCobrado));
  if (base <= 0) return NextResponse.json({ error: "El pedido ya está saldado." }, { status: 409 });
  const total = totalConPropina(base, montoPropina(base, propinaPct));
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  try {
    const { initPoint } = await crearPreferencia({
      pedidoId: pedido.id,
      monto: total,
      descripcion: `Cozizina — Mesa ${pedido.mesa?.numero ?? "s/n"}`,
      backUrls: {
        success: `${appUrl}/cliente/pago-ok`,
        failure: `${appUrl}/cliente/pago-error`,
        pending: `${appUrl}/cliente/pago-ok`,
      },
      notificationUrl: `${appUrl}/api/pagos/mercadopago/webhook`,
    });
    return NextResponse.json({ data: { initPoint, total } });
  } catch (e) {
    console.error("[pago/mercadopago]", e);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502 });
  }
}
