// Carrito de un pedido que toma el mozo. Funciones puras:
// cada una recibe el carrito y devuelve uno nuevo.

export interface LineaCarrito {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas: string;
}

export type Carrito = LineaCarrito[];

export const MAX_POR_LINEA = 20;

interface ProductoEntrante {
  id: string;
  nombre: string;
  precio: number;
}

export function agregarAlCarrito(carrito: Carrito, p: ProductoEntrante): Carrito {
  const existente = carrito.find((l) => l.productoId === p.id);
  if (!existente) {
    return [...carrito, { productoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, notas: "" }];
  }
  return cambiarCantidad(carrito, p.id, 1);
}

// Suma o resta unidades; al llegar a 0 la línea desaparece.
export function cambiarCantidad(carrito: Carrito, productoId: string, delta: number): Carrito {
  return carrito
    .map((l) =>
      l.productoId === productoId
        ? { ...l, cantidad: Math.min(MAX_POR_LINEA, l.cantidad + delta) }
        : l
    )
    .filter((l) => l.cantidad > 0);
}

export function fijarNota(carrito: Carrito, productoId: string, notas: string): Carrito {
  return carrito.map((l) => (l.productoId === productoId ? { ...l, notas } : l));
}

export function totalCarrito(carrito: Carrito): number {
  return carrito.reduce((s, l) => s + l.precio * l.cantidad, 0);
}

export function unidadesCarrito(carrito: Carrito): number {
  return carrito.reduce((s, l) => s + l.cantidad, 0);
}

export function cantidadDe(carrito: Carrito, productoId: string): number {
  return carrito.find((l) => l.productoId === productoId)?.cantidad ?? 0;
}
