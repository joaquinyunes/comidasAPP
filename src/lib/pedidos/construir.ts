// ============================================================
// Piezas compartidas entre el pedido de mesa y el de delivery:
// validar productos, armar las líneas, resolver el cupón.
// ============================================================

import { prisma } from "@/lib/prisma";
import { subtotalLinea, totalPedido } from "./precio";
import { evaluarCupon } from "./cupon";

export interface LineaEntrada {
  productoId: string;
  cantidad: number;
  notas?: string;
}

export interface LineaItemDB {
  tenantId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas: string | null;
  estado: string;
}

type ProductoMin = { id: string; precio: unknown; disponible: boolean; nombre: string };

// Carga los productos del pedido y valida disponibilidad.
export async function cargarProductos(
  tenantId: string,
  items: readonly LineaEntrada[]
): Promise<{ ok: true; porId: Map<string, ProductoMin> } | { ok: false; mensaje: string }> {
  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((i) => i.productoId) }, tenantId },
    select: { id: true, precio: true, disponible: true, nombre: true },
  });
  const porId = new Map(productos.map((p) => [p.id, p]));

  for (const it of items) {
    const p = porId.get(it.productoId);
    if (!p) return { ok: false, mensaje: "Hay un producto que ya no está en el menú." };
    if (!p.disponible) return { ok: false, mensaje: `"${p.nombre}" no está disponible por ahora.` };
  }
  return { ok: true, porId };
}

export function construirLineas(
  tenantId: string,
  porId: Map<string, ProductoMin>,
  items: readonly LineaEntrada[]
): { lineas: LineaItemDB[]; subtotal: number } {
  const lineas = items.map((it) => {
    const precio = Number(porId.get(it.productoId)!.precio);
    return {
      tenantId,
      productoId: it.productoId,
      cantidad: it.cantidad,
      precioUnitario: precio,
      subtotal: subtotalLinea(precio, it.cantidad),
      notas: it.notas ?? null,
      estado: "recibido",
    };
  });
  return { lineas, subtotal: totalPedido(lineas.map((l) => l.subtotal)) };
}

export interface CuponResuelto {
  id: string;
  codigo: string;
  descripcion: string;
  descuento: number;
}

// Devuelve el cupón resuelto, null si no se pasó código, o un error.
export async function resolverCupon(
  tenantId: string,
  codigo: string | undefined,
  subtotal: number
): Promise<{ ok: true; cupon: CuponResuelto | null } | { ok: false; mensaje: string }> {
  if (!codigo) return { ok: true, cupon: null };

  const cupon = await prisma.cupon.findFirst({
    where: { tenantId, codigo: codigo.toUpperCase() },
  });
  if (!cupon) return { ok: false, mensaje: "Ese cupón no existe." };

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
  if (!ev.valido) return { ok: false, mensaje: ev.motivo };

  return {
    ok: true,
    cupon: { id: cupon.id, codigo: cupon.codigo, descripcion: ev.descripcion, descuento: ev.descuento },
  };
}
