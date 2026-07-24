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
  const [darkMode, setDarkMode] = useState(false);

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

  const handleQuitar = (productoId: string) => {
    setPedido((prev) => {
      const existente = prev.find((p) => p.productoId === productoId);
      if (!existente) return prev;
      if (existente.cantidad > 1) {
        return prev.map((p) =>
          p.productoId === productoId ? { ...p, cantidad: p.cantidad - 1 } : p
        );
      }
      return prev.filter((p) => p.productoId !== productoId);
    });
  };

  const total = pedido.reduce((sum, p) => sum + p.producto.precio * p.cantidad, 0);
  const cantidadTotal = pedido.reduce((sum, p) => sum + p.cantidad, 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode
          ? "bg-gray-950/80 border-gray-800"
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-red-500/20">
              🍕
            </div>
            <div>
              <h1 className="font-bold text-lg">Pizzería La Nonna</h1>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Mesa 5 • Terraza</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setShowPedido(!showPedido)}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              🛒 Pedido
              {cantidadTotal > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {cantidadTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Resumen del pedido (si hay items) */}
      {showPedido && pedido.length > 0 && (
        <div className={`border-b animate-fadeIn ${darkMode ? "bg-gray-900 border-gray-800" : "bg-red-50 border-red-100"}`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h3 className="font-semibold mb-3">Tu pedido</h3>
            <div className="space-y-2">
              {pedido.map((item) => (
                <div key={item.productoId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span>{item.cantidad}x</span>
                    <span className="font-medium">{item.producto.nombre}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      ${(item.producto.precio * item.cantidad).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleQuitar(item.productoId)}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 text-xs flex items-center justify-center"
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={`flex justify-between mt-3 pt-3 border-t font-bold text-lg ${darkMode ? "border-gray-700" : "border-red-200"}`}>
              <span>Total</span>
              <span className="text-red-500">${total.toLocaleString()}</span>
            </div>
            <button className="w-full mt-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40">
              Enviar pedido a cocina
            </button>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
          <button
            onClick={() => setShowPedido(true)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-2xl shadow-red-500/30 px-6 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            🛒 Ver pedido ({cantidadTotal}) — ${total.toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}
