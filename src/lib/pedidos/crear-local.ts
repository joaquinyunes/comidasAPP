// ============================================================
// Creación de un pedido "en el local" (salón, sin mesa QR
// individual): el cliente escribe a mano su mesa o el mozo que lo
// atendió. Reutiliza las piezas compartidas de construir.ts.
// ============================================================

import { prisma, getTenantBySlug, getDefaultSucursal } from "@/lib/prisma";
import { redondear2 } from "./precio";
import { EVENTO_CREADO, pedidoExistentePorClave } from "./idempotencia";
import { cargarProductos, construirLineas, resolverCupon, type LineaEntrada } from "./construir";
import { evaluarStock } from "./stock-disponibilidad";
import { descontarStock } from "./stock-consumo";

export interface CrearLocalInput {
  tenantSlug: string;
  items: LineaEntrada[];
  referencia: string;
  notas?: string;
  cuponCodigo?: string;
  idempotencyKey?: string;
}

export type CrearLocalResult =
  | { ok: true; duplicado: boolean; pedidoId: string; subtotal: number; descuento: number; total: number }
  | { ok: false; codigo: "LOCAL_NO_ENCONTRADO" | "PRODUCTO_INVALIDO" | "SIN_STOCK" | "CUPON_INVALIDO"; mensaje: string; faltantes?: string[] };

export async function crearPedidoLocal(input: CrearLocalInput): Promise<CrearLocalResult> {
  const tenant = await getTenantBySlug(input.tenantSlug);
  if (!tenant) return { ok: false, codigo: "LOCAL_NO_ENCONTRADO", mensaje: "Local no encontrado." };
  const sucursal = await getDefaultSucursal(tenant.id);
  if (!sucursal) return { ok: false, codigo: "LOCAL_NO_ENCONTRADO", mensaje: "El local no tiene sucursal activa." };

  if (input.idempotencyKey) {
    const existente = await pedidoExistentePorClave(prisma, { tenantId: tenant.id, clave: input.idempotencyKey });
    if (existente) {
      const p = await prisma.pedido.findUnique({ where: { id: existente }, select: { id: true, total: true } });
      if (p) {
        return { ok: true, duplicado: true, pedidoId: p.id, subtotal: Number(p.total), descuento: 0, total: Number(p.total) };
      }
    }
  }

  const prods = await cargarProductos(tenant.id, input.items);
  if (!prods.ok) return { ok: false, codigo: "PRODUCTO_INVALIDO", mensaje: prods.mensaje };

  const { lineas, subtotal } = construirLineas(tenant.id, prods.porId, input.items);

  let stockControlado = false;
  try {
    const s = await evaluarStock(prisma, { tenantId: tenant.id, sucursalId: sucursal.id, lineas: input.items });
    stockControlado = s.controlado;
    if (s.controlado && !s.ok) {
      return { ok: false, codigo: "SIN_STOCK", mensaje: "Nos quedamos sin ingredientes para parte del pedido.", faltantes: s.faltantes.map((f) => f.nombre) };
    }
  } catch (e) {
    console.error("[crear-local] evaluarStock:", e);
  }

  const cup = await resolverCupon(tenant.id, input.cuponCodigo, subtotal);
  if (!cup.ok) return { ok: false, codigo: "CUPON_INVALIDO", mensaje: cup.mensaje };

  const descuento = cup.cupon?.descuento ?? 0;
  const total = redondear2(Math.max(0, subtotal - descuento));
  const notasPedido = `Mesa/Mozo: ${input.referencia}${input.notas ? ` — ${input.notas}` : ""}`;

  const pedido = await prisma.$transaction(async (tx) => {
    const creado = await tx.pedido.create({
      data: {
        tenantId: tenant.id,
        sucursalId: sucursal.id,
        tipo: "local",
        estado: "recibido",
        notas: notasPedido,
        total,
        items: { create: lineas },
      },
      select: { id: true },
    });

    await tx.pedidoEvento.create({
      data: {
        tenantId: tenant.id,
        pedidoId: creado.id,
        evento: EVENTO_CREADO,
        metadata: { origen: "local_qr", referencia: input.referencia, idempotencyKey: input.idempotencyKey ?? null, subtotal, descuento, total },
      },
    });

    if (cup.cupon) {
      await tx.cupon.update({ where: { id: cup.cupon.id }, data: { usosActuales: { increment: 1 } } });
      await tx.pedidoEvento.create({
        data: { tenantId: tenant.id, pedidoId: creado.id, evento: "CUPON_APLICADO", metadata: { codigo: cup.cupon.codigo, descuento } },
      });
    }

    if (stockControlado) {
      try {
        await descontarStock(tx, { tenantId: tenant.id, sucursalId: sucursal.id, pedidoId: creado.id, lineas: input.items });
      } catch (e) {
        console.error("[crear-local] descontarStock:", e);
      }
    }

    return creado;
  });

  return { ok: true, duplicado: false, pedidoId: pedido.id, subtotal, descuento, total };
}
