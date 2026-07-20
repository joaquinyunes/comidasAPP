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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Imagen */}
        <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center text-3xl">
          {producto.imagenUrl ? (
            <img
              src={producto.imagenUrl}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            "🍽️"
          )}
        </div>

        {/* Contenido */}
        <CardContent className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{producto.nombre}</h3>
              {producto.descripcion && (
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                  {producto.descripcion}
                </p>
              )}
            </div>
            <span className="font-bold text-red-600">
              {formatCurrency(producto.precio)}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-1 mt-2">
            {producto.tiempoPreparacionMin && (
              <Badge variant="secondary" className="text-xs">
                ⏱️ {producto.tiempoPreparacionMin} min
              </Badge>
            )}
            {producto.nivelPicante > 0 && (
              <Badge variant="secondary" className="text-xs">
                🌶️ {producto.nivelPicante}
              </Badge>
            )}
            {producto.calorias && (
              <Badge variant="secondary" className="text-xs">
                🔥 {producto.calorias} cal
              </Badge>
            )}
            {producto.alergenos.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                ⚠️ {producto.alergenos.join(", ")}
              </Badge>
            )}
          </div>

          {/* Botón agregar */}
          <div className="flex items-center justify-between mt-3">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAgregar();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {cantidadEnPedido > 0 ? (
                <>
                  ✓ Agregado ({cantidadEnPedido}) — Agregar más
                </>
              ) : (
                "+ Agregar"
              )}
            </Button>
            {producto.destacado && (
              <Badge className="bg-orange-500">🔥 Popular</Badge>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
