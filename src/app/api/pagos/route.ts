import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mesaSinPendientes } from "@/lib/pedidos/mesa-sin-pendientes";
import { validarCobro } from "@/lib/pedidos/validar-cobro";
import { getTenantContext } from "@/lib/auth-context";
import { z } from "zod";

const METODOS = ["efectivo", "tarjeta", "qr", "transferencia", "tarjeta_credito", "tarjeta_debito", "qr_mp"] as const; // los 3 últimos: compat

const PagoSchema = z.object({
  pedidoId: z.string().uuid(),
  monto: z.number().positive().max(100_000_000),
  propina: z.number().min(0).max(100_000_000).default(0),
  metodoPago: z.enum(METODOS),
  cajaId: z.string().uuid().nullish(),
  // Cobrar menos que el saldo exige declararlo y dar el motivo (queda en el evento del pedido).
  parcial: z.boolean().default(false),
  motivo: z.string().trim().max(200).nullish(),
});

// ============================================
// POST /api/pagos — Crear pago
// ============================================

export async function POST(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const parsed = PagoSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", details: parsed.error.issues }, { status: 400 });
    }
    const { pedidoId, monto, propina, metodoPago, cajaId, parcial, motivo } = parsed.data;

    const pedido = await prisma.pedido.findFirst({
      where: { id: pedidoId, tenantId: ctx.tenantId },
      select: { id: true, tenantId: true, mesaId: true },
    });
    if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    if (cajaId && !(await prisma.caja.findFirst({ where: { id: cajaId, tenantId: ctx.tenantId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Caja no encontrada" }, { status: 404 });
    }

    // El saldo se lee y se valida DENTRO de la transacción, con el pedido bloqueado:
    // dos cobros a la vez del mismo pedido se hacen en fila y no se pisan.
    const resultado = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM pedidos WHERE id = ${pedido.id}::uuid FOR UPDATE`;
      const actual = await tx.pedido.findUniqueOrThrow({ where: { id: pedido.id }, select: { total: true, estado: true } });
      if (actual.estado === "cancelado") return { error: "El pedido está cancelado: no se puede cobrar.", status: 409 } as const;

      const previos = await tx.pago.findMany({
        where: { pedidoId: pedido.id, estado: "completado" },
        select: { id: true, monto: true, propina: true },
      });
      const cobrado = previos.reduce((a, p) => a + (Number(p.monto) - Number(p.propina)), 0);
      const decision = validarCobro({ total: Number(actual.total), cobrado, monto, propina, parcial, motivo });
      if (!decision.ok) {
        if (decision.codigo === "YA_PAGADO") return { yaPagado: previos[0]?.id ?? "" } as const;
        return { error: decision.mensaje, status: decision.status } as const;
      }

      const creado = await tx.pago.create({
        data: { tenantId: pedido.tenantId, pedidoId, cajaId: cajaId ?? null, monto, propina, metodoPago, estado: "completado", usuarioId: ctx.usuarioId },
      });

      if (decision.salda) {
        await tx.pedido.update({ where: { id: pedidoId }, data: { estado: "pagado" } });
        // La mesa se libera solo si no le queda otra comanda sin cobrar.
        if (pedido.mesaId && (await mesaSinPendientes(tx, pedido.mesaId, pedidoId))) {
          await tx.mesa.update({ where: { id: pedido.mesaId }, data: { estado: "libre" } });
        }
      }

      await tx.pedidoEvento.create({
        data: {
          tenantId: pedido.tenantId,
          pedidoId,
          usuarioId: ctx.usuarioId,
          evento: decision.salda ? "PAGO_COMPLETADO" : "PAGO_PARCIAL",
          metadata: { pagoId: creado.id, monto, metodoPago, saldoAntes: decision.saldoAntes, ...(decision.salda ? {} : { motivo }) },
        },
      });
      // Quién cobró queda también en la auditoría (inmutable), dentro de la misma transacción.
      await tx.auditLog.create({
        data: {
          tenantId: pedido.tenantId,
          usuarioId: ctx.usuarioId,
          accion: "create",
          entidad: "Pago",
          entidadId: creado.id,
          valorNuevo: { pedidoId, monto, propina, metodoPago, parcial: !decision.salda, ...(decision.salda ? {} : { motivo }) },
        },
      });
      return { pago: creado } as const;
    });

    if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    if ("yaPagado" in resultado) {
      return NextResponse.json({ success: true, yaPagado: true, pago: { id: resultado.yaPagado } });
    }
    const pago = resultado.pago;

    return NextResponse.json({
      success: true,
      pago: {
        id: pago.id,
        monto: pago.monto,
        propina: pago.propina,
        metodoPago: pago.metodoPago,
        estado: pago.estado,
        createdAt: pago.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al crear pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/pagos — Listar pagos
// ============================================

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("pedidoId");
    const cajaId = searchParams.get("cajaId");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const where: Record<string, unknown> = { tenantId: ctx.tenantId };

    if (pedidoId) where.pedidoId = pedidoId;
    if (cajaId) where.cajaId = cajaId;
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) (where.createdAt as Record<string, Date>).gte = new Date(desde);
      if (hasta) (where.createdAt as Record<string, Date>).lte = new Date(hasta);
    }

    const pagos = await prisma.pago.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ pagos });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
