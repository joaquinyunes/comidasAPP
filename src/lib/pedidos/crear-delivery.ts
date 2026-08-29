// ============================================================
// Creación de un pedido de delivery (sin mesa). Reutiliza las
// piezas compartidas de construir.ts.
// ============================================================

import { prisma, getTenantBySlug, getDefaultSucursal } from "@/lib/prisma";
import { redondear2 } from "./precio";
import { EVENTO_CREADO, pedidoExistentePorClave } from "./idempotencia";
import { cargarProductos, construirLineas, resolverCupon, type LineaEntrada } from "./construir";
import { evaluarStock } from "./stock-disponibilidad";
import { descontarStock } from "./stock-consumo";

export interface CrearDeliveryInput {
  tenantSlug: string;
  items: LineaEntrada[];
  nombre: string;
  telefono: string;
  direccion: string;
  zonaId: string;
  notas?: string;
  cuponCodigo?: string;
  idempotencyKey?: string;
}

export type CrearDeliveryResult =
  | {
      ok: true;
      duplicado: boolean;
      pedidoId: string;
      subtotal: number;
      descuento: number;
      envio: number;
      total: number;
      tiempoEstimadoMin: number;
    }
  | { ok: false; codigo: "LOCAL_NO_ENCONTRADO" | "ZONA_INVALIDA" | "PRODUCTO_INVALIDO" | "SIN_STOCK" | "CUPON_INVALIDO"; mensaje: string; faltantes?: string[] };

export async function crearPedidoDelivery(input: CrearDeliveryInput): Promise<CrearDeliveryResult> {
  const tenant = await getTenantBySlug(input.tenantSlug);
  if (!tenant) return { ok: false, codigo: "LOCAL_NO_ENCONTRADO", mensaje: "Local no encontrado." };
  const sucursal = await getDefaultSucursal(tenant.id);
  if (!sucursal) return { ok: false, codigo: "LOCAL_NO_ENCONTRADO", mensaje: "El local no tiene sucursal activa." };

  if (input.idempotencyKey) {
    const existente = await pedidoExistentePorClave(prisma, { tenantId: tenant.id, clave: input.idempotencyKey });
    if (existente) {
      const p = await prisma.pedido.findUnique({
        where: { id: existente },
        select: { id: true, total: true, costoEnvio: true },
      });
      if (p) {
        return {
          ok: true,
          duplicado: true,
          pedidoId: p.id,
          subtotal: Number(p.total) - Number(p.costoEnvio),
          descuento: 0,
          envio: Number(p.costoEnvio),
          total: Number(p.total),
          tiempoEstimadoMin: 0,
        };
      }
    }
  }

  const zona = await prisma.zonaReparto.findFirst({
    where: { id: input.zonaId, tenantId: tenant.id, activa: true },
    select: { id: true, costoEnvio: true, tiempoEstimadoMin: true },
  });
  if (!zona) return { ok: false, codigo: "ZONA_INVALIDA", mensaje: "Elegí una zona de reparto válida." };

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
    console.error("[crear-delivery] evaluarStock:", e);
  }

  const cup = await resolverCupon(tenant.id, input.cuponCodigo, subtotal);
  if (!cup.ok) return { ok: false, codigo: "CUPON_INVALIDO", mensaje: cup.mensaje };

  const descuento = cup.cupon?.descuento ?? 0;
  const envio = Number(zona.costoEnvio);
  const total = redondear2(Math.max(0, subtotal - descuento) + envio);

  const pedido = await prisma.$transaction(async (tx) => {
    const existenteCliente = await tx.cliente.findFirst({
      where: { tenantId: tenant.id, telefono: input.telefono },
      select: { id: true },
    });
    const cliente =
      existenteCliente ??
      (await tx.cliente.create({
        data: { tenantId: tenant.id, nombre: input.nombre, telefono: input.telefono },
        select: { id: true },
      }));

    const creado = await tx.pedido.create({
      data: {
        tenantId: tenant.id,
        sucursalId: sucursal.id,
        clienteId: cliente.id,
        tipo: "delivery",
        estado: "recibido",
        direccionEntrega: input.direccion,
        telefonoContacto: input.telefono,
        costoEnvio: envio,
        notas: input.notas ?? null,
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
        metadata: { origen: "delivery", idempotencyKey: input.idempotencyKey ?? null, subtotal, descuento, envio, total },
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
        console.error("[crear-delivery] descontarStock:", e);
      }
    }

    return creado;
  });

  return {
    ok: true,
    duplicado: false,
    pedidoId: pedido.id,
    subtotal,
    descuento,
    envio,
    total,
    tiempoEstimadoMin: zona.tiempoEstimadoMin,
  };
}
