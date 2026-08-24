// ============================================================
// Orquestación de la creación de un pedido hecho por el cliente
// desde la mesa. Una sola responsabilidad: dejar el pedido en la
// BD de forma consistente (ítems, cupón, evento, stock) o explicar
// por qué no se pudo.
//
// La ruta HTTP solo traduce este resultado a códigos de estado.
// ============================================================

import { prisma } from "@/lib/prisma";
import { subtotalLinea, totalPedido, redondear2 } from "./precio";
import { pedidoExistentePorClave, EVENTO_CREADO } from "./idempotencia";
import { evaluarStock } from "./stock-disponibilidad";
import { descontarStock } from "./stock-consumo";
import { evaluarCupon } from "./cupon";

export interface LineaEntrada {
  productoId: string;
  cantidad: number;
  notas?: string;
}

export interface CrearPedidoInput {
  mesaId: string;
  clienteId?: string;
  idempotencyKey?: string;
  cuponCodigo?: string;
  items: LineaEntrada[];
}

export type CrearPedidoResult =
  | {
      ok: true;
      duplicado: boolean;
      pedidoId: string;
      estado: string;
      subtotal: number;
      descuento: number;
      total: number;
      cupon: string | null;
      items: { id: string; productoId: string; cantidad: number; estado: string }[];
    }
  | { ok: false; codigo: "MESA_NO_ENCONTRADA"; mensaje: string }
  | { ok: false; codigo: "PRODUCTO_INVALIDO"; mensaje: string }
  | { ok: false; codigo: "SIN_STOCK"; mensaje: string; faltantes: string[] }
  | { ok: false; codigo: "CUPON_INVALIDO"; mensaje: string };

async function evaluarStockSeguro(
  db: Parameters<typeof evaluarStock>[0],
  args: Parameters<typeof evaluarStock>[1]
) {
  try {
    return await evaluarStock(db, args);
  } catch (e) {
    console.error("[pedidos/crear] evaluarStock falló, se continúa:", e);
    return { controlado: false, ok: true, faltantes: [] as { nombre: string }[] };
  }
}

async function descontarStockSeguro(
  db: Parameters<typeof descontarStock>[0],
  args: Parameters<typeof descontarStock>[1]
) {
  try {
    await descontarStock(db, args);
  } catch (e) {
    console.error("[pedidos/crear] descontarStock falló, se continúa:", e);
  }
}

export async function crearPedidoCliente(input: CrearPedidoInput): Promise<CrearPedidoResult> {
  const mesa = await prisma.mesa.findFirst({
    where: { id: input.mesaId },
    select: { id: true, tenantId: true, sucursalId: true },
  });
  if (!mesa) {
    return { ok: false, codigo: "MESA_NO_ENCONTRADA", mensaje: "La mesa no existe." };
  }

  // Idempotencia: mismo pedido reenviado -> devolvemos el que ya está.
  if (input.idempotencyKey) {
    const existenteId = await pedidoExistentePorClave(prisma, {
      tenantId: mesa.tenantId,
      clave: input.idempotencyKey,
    });
    if (existenteId) {
      const p = await prisma.pedido.findUnique({
        where: { id: existenteId },
        select: {
          id: true,
          estado: true,
          total: true,
          items: { select: { id: true, productoId: true, cantidad: true, estado: true } },
        },
      });
      if (p) {
        return {
          ok: true,
          duplicado: true,
          pedidoId: p.id,
          estado: p.estado,
          subtotal: Number(p.total),
          descuento: 0,
          total: Number(p.total),
          cupon: null,
          items: p.items,
        };
      }
    }
  }

  const productos = await prisma.producto.findMany({
    where: { id: { in: input.items.map((i) => i.productoId) }, tenantId: mesa.tenantId },
    select: { id: true, precio: true, disponible: true, nombre: true },
  });
  const porId = new Map(productos.map((p) => [p.id, p]));

  for (const it of input.items) {
    const p = porId.get(it.productoId);
    if (!p) return { ok: false, codigo: "PRODUCTO_INVALIDO", mensaje: "Producto no disponible en el menú." };
    if (!p.disponible) {
      return { ok: false, codigo: "PRODUCTO_INVALIDO", mensaje: `"${p.nombre}" no está disponible por ahora.` };
    }
  }

  const stock = await evaluarStockSeguro(prisma, {
    tenantId: mesa.tenantId,
    sucursalId: mesa.sucursalId,
    lineas: input.items,
  });
  if (stock.controlado && !stock.ok) {
    return {
      ok: false,
      codigo: "SIN_STOCK",
      mensaje: "Nos quedamos sin ingredientes para parte de tu pedido.",
      faltantes: stock.faltantes.map((f) => f.nombre),
    };
  }

  const lineasItem = input.items.map((it) => {
    const p = porId.get(it.productoId)!;
    const precio = Number(p.precio);
    return {
      tenantId: mesa.tenantId,
      productoId: p.id,
      cantidad: it.cantidad,
      precioUnitario: precio,
      subtotal: subtotalLinea(precio, it.cantidad),
      notas: it.notas ?? null,
      estado: "recibido",
    };
  });
  const subtotal = totalPedido(lineasItem.map((l) => l.subtotal));

  // ---- Cupón (opcional) ----
  let descuento = 0;
  let cuponAplicado: { id: string; codigo: string; descripcion: string } | null = null;
  if (input.cuponCodigo) {
    const cupon = await prisma.cupon.findFirst({
      where: { tenantId: mesa.tenantId, codigo: input.cuponCodigo.toUpperCase() },
    });
    if (!cupon) {
      return { ok: false, codigo: "CUPON_INVALIDO", mensaje: "Ese cupón no existe." };
    }
    const ev = evaluarCupon(
      {
        codigo: cupon.codigo,
        tipo: cupon.tipo,
        valor: Number(cupon.valor),
        activo: cupon.activo,
        fechaInicio: cupon.fechaInicio,
        fechaFin: cupon.fechaFin,
        usosMaximos: cupon.usosMaximos,
        usosActuales: cupon.usosActuales,
        minimoCompra: Number(cupon.minimoCompra),
      },
      subtotal
    );
    if (!ev.valido) {
      return { ok: false, codigo: "CUPON_INVALIDO", mensaje: ev.motivo };
    }
    descuento = ev.descuento;
    cuponAplicado = { id: cupon.id, codigo: cupon.codigo, descripcion: ev.descripcion };
  }

  const total = redondear2(Math.max(0, subtotal - descuento));

  const pedido = await prisma.$transaction(async (tx) => {
    const creado = await tx.pedido.create({
      data: {
        tenantId: mesa.tenantId,
        sucursalId: mesa.sucursalId,
        mesaId: mesa.id,
        clienteId: input.clienteId ?? null,
        tipo: "mesa",
        estado: "recibido",
        total,
        items: { create: lineasItem },
      },
      select: {
        id: true,
        estado: true,
        items: { select: { id: true, productoId: true, cantidad: true, estado: true } },
      },
    });

    await tx.pedidoEvento.create({
      data: {
        tenantId: mesa.tenantId,
        pedidoId: creado.id,
        evento: EVENTO_CREADO,
        metadata: {
          origen: "cliente_mesa",
          idempotencyKey: input.idempotencyKey ?? null,
          subtotal,
          descuento,
          total,
        },
      },
    });

    if (cuponAplicado) {
      await tx.cupon.update({
        where: { id: cuponAplicado.id },
        data: { usosActuales: { increment: 1 } },
      });
      await tx.pedidoEvento.create({
        data: {
          tenantId: mesa.tenantId,
          pedidoId: creado.id,
          evento: "CUPON_APLICADO",
          metadata: { codigo: cuponAplicado.codigo, descuento },
        },
      });
    }

    if (stock.controlado) {
      await descontarStockSeguro(tx, {
        tenantId: mesa.tenantId,
        sucursalId: mesa.sucursalId,
        pedidoId: creado.id,
        lineas: input.items,
      });
    }

    return creado;
  });

  return {
    ok: true,
    duplicado: false,
    pedidoId: pedido.id,
    estado: pedido.estado,
    subtotal,
    descuento,
    total,
    cupon: cuponAplicado?.codigo ?? null,
    items: pedido.items,
  };
}
