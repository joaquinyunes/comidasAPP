"use client";

import { useState } from "react";
import { MenuDigital } from "@/components/menu-digital";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Producto, CategoriaMenu } from "@/types";

// Datos de ejemplo (en producción vendría de la API)
const CATEGORIAS_EJEMPLO: CategoriaMenu[] = [
  {
    id: "1",
    nombre: "Pizzas",
    productos: [
      {
        id: "p1",
        nombre: "Pizza Napolitana",
        descripcion: "Salsa de tomate, mozzarella, albahaca fresca",
        precio: 12500,
        tiempoPreparacionMin: 15,
        nivelPicante: 0,
        calorias: 850,
        alergenos: ["gluten", "lactosa"],
        disponible: true,
        destacado: true,
        tipo: "plato",
      },
      {
        id: "p2",
        nombre: "Pizza Fugazzeta",
        descripcion: "Cebolla, mozzarella, oregano",
        precio: 14000,
        tiempoPreparacionMin: 18,
        nivelPicante: 0,
        calorias: 920,
        alergenos: ["gluten", "lactosa"],
        disponible: true,
        destacado: false,
        tipo: "plato",
      },
    ],
  },
  {
    id: "2",
    nombre: "Pastas",
    productos: [
      {
        id: "pa1",
        nombre: "Ñoquis Caseros",
        descripcion: "Ñoquis hechos a mano con salsa fileto",
        precio: 9800,
        tiempoPreparacionMin: 20,
        nivelPicante: 0,
        calorias: 650,
        alergenos: ["gluten", "huevo"],
        disponible: true,
        destacado: false,
        tipo: "plato",
      },
    ],
  },
  {
    id: "3",
    nombre: "Bebidas",
    productos: [
      {
        id: "b1",
        nombre: "Coca-Cola",
        descripcion: "500ml",
        precio: 2500,
        nivelPicante: 0,
        calorias: 210,
        alergenos: [],
        disponible: true,
        destacado: false,
        tipo: "bebida",
      },
      {
        id: "b2",
        nombre: "Cerveza Artesanal",
        descripcion: "IPA 500ml",
        precio: 4500,
        nivelPicante: 0,
        calorias: 180,
        alergenos: ["gluten"],
        disponible: true,
        destacado: true,
        tipo: "bebida",
      },
    ],
  },
];

export default function MenuPage() {
  const [pedido, setPedido] = useState<{ productoId: string; cantidad: number; producto: Producto }[]>([]);
  const [showPedido, setShowPedido] = useState(false);

  const handleAgregar = (producto: Producto) => {
    setPedido((prev) => {
      const existente = prev.find((p) => p.productoId === producto.id);
      if (existente) {
        return prev.map((p) =>
          p.productoId === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { productoId: producto.id, cantidad: 1, producto }];
    });
  };

  const total = pedido.reduce((sum, p) => sum + p.producto.precio * p.cantidad, 0);
  const cantidadTotal = pedido.reduce((sum, p) => sum + p.cantidad, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <div>
              <h1 className="font-bold text-lg">Pizzería La Nonna</h1>
              <p className="text-xs text-gray-500">Mesa 5 • Terraza</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPedido(!showPedido)}
            className="relative"
          >
            🛒 Pedido
            {cantidadTotal > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {cantidadTotal}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Resumen del pedido (si hay items) */}
      {showPedido && pedido.length > 0 && (
        <div className="bg-red-50 border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <h3 className="font-semibold mb-2">Tu pedido</h3>
            <div className="space-y-1">
              {pedido.map((item) => (
                <div key={item.productoId} className="flex justify-between text-sm">
                  <span>
                    {item.cantidad}x {item.producto.nombre}
                  </span>
                  <span className="font-medium">
                    ${(item.producto.precio * item.cantidad).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t font-bold">
              <span>Total</span>
              <span className="text-red-600">${total.toLocaleString()}</span>
            </div>
            <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
              Enviar pedido a cocina
            </Button>
          </div>
        </div>
      )}

      {/* Menú */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <MenuDigital
          categorias={CATEGORIAS_EJEMPLO}
          onAgregarAlPedido={handleAgregar}
          pedidoActual={pedido.map((p) => ({
            productoId: p.productoId,
            cantidad: p.cantidad,
          }))}
        />
      </div>

      {/* Botón flotante de pedido */}
      {pedido.length > 0 && !showPedido && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            size="lg"
            onClick={() => setShowPedido(true)}
            className="bg-red-600 hover:bg-red-700 shadow-lg px-6 py-3 rounded-full"
          >
            🛒 Ver pedido ({cantidadTotal}) — ${total.toLocaleString()}
          </Button>
        </div>
      )}
    </div>
  );
}
