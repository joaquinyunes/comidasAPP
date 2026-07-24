"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { Producto, CategoriaMenu } from "@/types";

// ============================================
// MENÚ DIGITAL PÚBLICO (con mejoras móvil)
// ============================================

interface MenuDigitalProps {
  categorias: CategoriaMenu[];
  onAgregarAlPedido?: (producto: Producto) => void;
  pedidoActual?: { productoId: string; cantidad: number }[];
}

export function MenuDigital({
  categorias,
  onAgregarAlPedido,
  pedidoActual = [],
}: MenuDigitalProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  const categoriasFiltradas = categoriaActiva
    ? categorias.filter((c) => c.id === categoriaActiva)
    : categorias;

  const getCantidadEnPedido = (productoId: string) => {
    return pedidoActual.find((p) => p.productoId === productoId)?.cantidad || 0;
  };

  const cantidadTotal = pedidoActual.reduce((sum, p) => sum + p.cantidad, 0);
  const totalEstimado = pedidoActual.reduce((sum, p) => {
    for (const cat of categorias) {
      const prod = cat.productos.find((pr) => pr.id === p.productoId);
      if (prod) return sum + prod.precio * p.cantidad;
    }
    return sum;
  }, 0);

  return (
    <>
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Categorías - scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sticky top-0 bg-white z-30">
        <Button
          variant={categoriaActiva === null ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoriaActiva(null)}
          className="whitespace-nowrap"
        >
          Todo
        </Button>
        {categorias.map((cat) => (
          <Button
            key={cat.id}
            variant={categoriaActiva === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaActiva(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.nombre}
          </Button>
        ))}
      </div>

      {/* Productos */}
      <div className="space-y-8">
        {categoriasFiltradas.map((categoria) => (
          <section key={categoria.id}>
            <h2 className="text-xl font-bold mb-4">{categoria.nombre}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoria.productos
                .filter((p) => p.disponible)
                .map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    cantidadEnPedido={getCantidadEnPedido(producto.id)}
                    onAgregar={() => onAgregarAlPedido?.(producto)}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>

    {/* Botón flotante móvil */}
    {cantidadTotal > 0 && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 shadow-lg px-6 py-3 rounded-full"
          onClick={() => {}}
        >
          🛒 Ver pedido ({cantidadTotal}) — {formatCurrency(totalEstimado)}
        </Button>
      </div>
    )}
    </>
  );
}

// ============================================
// TARJETA DE PRODUCTO
// ============================================

interface ProductoCardProps {
  producto: Producto;
  cantidadEnPedido: number;
  onAgregar: () => void;
}

function ProductoCard({ producto, cantidadEnPedido, onAgregar }: ProductoCardProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
      <div className="flex">
        {/* Imagen */}
        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-orange-50 to-red-50 flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden">
          {producto.imagenUrl ? (
            <img
              src={producto.imagenUrl}
              alt={producto.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="group-hover:scale-110 transition-transform duration-300">🍽️</span>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base leading-tight">{producto.nombre}</h3>
              {producto.descripcion && (
                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                  {producto.descripcion}
                </p>
              )}
            </div>
            <span className="font-bold text-red-500 text-sm sm:text-base whitespace-nowrap">
              {formatCurrency(producto.precio)}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-1 mt-2">
            {producto.tiempoPreparacionMin && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                ⏱ {producto.tiempoPreparacionMin}min
              </span>
            )}
            {producto.nivelPicante > 0 && (
              <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                🌶 {producto.nivelPicante}
              </span>
            )}
            {producto.calorias && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                🔥 {producto.calorias}
              </span>
            )}
            {producto.alergenos.length > 0 && (
              <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                ⚠ {producto.alergenos.join(", ")}
              </span>
            )}
            {producto.destacado && (
              <span className="text-[10px] bg-gradient-to-r from-orange-400 to-red-400 text-white px-2 py-0.5 rounded-full font-medium">
                🔥 Popular
              </span>
            )}
          </div>

          {/* Botón agregar */}
          <div className="mt-3">
            {cantidadEnPedido > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onAgregar(); }}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-colors flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-sm">{cantidadEnPedido}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onAgregar(); }}
                  className="w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 font-bold text-sm transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAgregar(); }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-red-500/20 hover:shadow-red-500/30"
              >
                + Agregar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
