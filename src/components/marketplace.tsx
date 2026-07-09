"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

interface ProductoMarketplace {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  tiempoPreparacion: number;
  disponible: boolean;
  destacado: boolean;
  calificacion: number;
  totalPedidos: number;
}

interface PedidoDelivery {
  id: string;
  numero: number;
  estado: "recibido" | "confirmado" | "preparando" | "listo" | "en_camino" | "entregado";
  cliente: { nombre: string; telefono: string; direccion: string };
  items: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  metodoPago: string;
  tiempoEstimado: number;
  createdAt: Date;
}

// ============================================
// COMPONENTE: Menú Marketplace
// ============================================

export function MenuMarketplace() {
  const [carrito, setCarrito] = useState<{ producto: ProductoMarketplace; cantidad: number }[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("todos");

  const productosMock: ProductoMarketplace[] = [
    { id: "p1", nombre: "Pizza Muzzarella", descripcion: "Salsa de tomate, mozzarella, albahaca fresca", precio: 5000, tiempoPreparacion: 15, disponible: true, destacado: true, calificacion: 4.8, totalPedidos: 1250 },
    { id: "p2", nombre: "Fugazzeta Rellena", descripcion: "Cebolla caramelizada y mozzarella", precio: 6500, tiempoPreparacion: 20, disponible: true, destacado: true, calificacion: 4.9, totalPedidos: 890 },
    { id: "p3", nombre: "Empanadas x12", descripcion: "Carne, jamón y queso, cebolla", precio: 9500, tiempoPreparacion: 25, disponible: true, destacado: false, calificacion: 4.7, totalPedidos: 650 },
    { id: "p4", nombre: "Ñoquis Caseros", descripcion: "Ñoquis artesanales con salsa fileto", precio: 4500, tiempoPreparacion: 30, disponible: true, destacado: false, calificacion: 4.6, totalPedidos: 420 },
    { id: "p5", nombre: "Limonada Natural", descripcion: "Receta casera con menta fresca", precio: 1500, tiempoPreparacion: 5, disponible: true, destacado: false, calificacion: 4.5, totalPedidos: 380 },
  ];

  const productosFiltrados = productosMock.filter((p) => {
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroTiempo === "rapido" && p.tiempoPreparacion > 15) return false;
    if (filtroTiempo === "medio" && (p.tiempoPreparacion <= 15 || p.tiempoPreparacion > 25)) return false;
    if (filtroTiempo === "largo" && p.tiempoPreparacion <= 25) return false;
    return p.disponible;
  });

  const totalCarrito = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const totalTiempo = carrito.length > 0 ? Math.max(...carrito.map((i) => i.producto.tiempoPreparacion)) : 0;

  const agregarAlCarrito = (producto: ProductoMarketplace) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">🍕 Pizzaria Demo</h1>
              <p className="text-xs text-red-200">Delivery • Retiro en local</p>
            </div>
            <div className="relative">
              <span className="text-2xl">🛒</span>
              {carrito.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Búsqueda y filtros */}
        <div className="flex gap-4">
          <Input
            placeholder="🔍 Buscar platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-white"
          />
          <Select value={filtroTiempo} onValueChange={(v) => { if (v) setFiltroTiempo(v) }}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="rapido">⚡ Rápido (&lt;15min)</SelectItem>
              <SelectItem value="medio">🕐 Medio (15-25min)</SelectItem>
              <SelectItem value="largo">🕑 Largo (&gt;25min)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Productos destacados */}
        <div>
          <h2 className="font-bold text-lg mb-3">⭐ Populares</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {productosMock.filter((p) => p.destacado).map((producto) => (
              <Card key={producto.id} className="min-w-[250px] hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-bold">{producto.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">{producto.descripcion}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-500">⭐ {producto.calificacion}</span>
                    <span className="text-xs text-gray-400">({producto.totalPedidos} pedidos)</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-red-600">${producto.precio.toLocaleString("es-AR")}</span>
                    <Button size="sm" onClick={() => agregarAlCarrito(producto)}>+ Agregar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Todos los productos */}
        <div>
          <h2 className="font-bold text-lg mb-3">📋 Todo el menú</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productosFiltrados.map((producto) => (
              <Card key={producto.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold">{producto.nombre}</h3>
                      <p className="text-sm text-gray-500">{producto.descripcion}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span>⭐ {producto.calificacion}</span>
                        <span className="text-gray-400">•</span>
                        <span>🕐 {producto.tiempoPreparacion} min</span>
                        <span className="text-gray-400">•</span>
                        <span>{producto.totalPedidos} pedidos</span>
                      </div>
                      <p className="text-lg font-bold text-red-600 mt-2">${producto.precio.toLocaleString("es-AR")}</p>
                    </div>
                    <Button onClick={() => agregarAlCarrito(producto)} className="self-end">+ Agregar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Barra flotante del carrito */}
      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {carrito.reduce((sum, item) => sum + item.cantidad, 0)} items • 🕐 ~{totalTiempo} min
              </span>
              <span className="text-xl font-bold">{formatCurrency(totalCarrito)}</span>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Ir al checkout • {formatCurrency(totalCarrito)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: Panel de Delivery (Backoffice)
// ============================================

export function PanelDelivery() {
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const pedidosMock: PedidoDelivery[] = [
    {
      id: "del-1", numero: 1001,
      estado: "preparando",
      cliente: { nombre: "Juan Pérez", telefono: "+54 11 1111-2222", direccion: "Av. Corrientes 1234" },
      items: [{ nombre: "Pizza Muzzarella", cantidad: 2, precio: 5000 }, { nombre: "Fugazzeta", cantidad: 1, precio: 6500 }],
      total: 16500, metodoPago: "tarjeta", tiempoEstimado: 20, createdAt: new Date(),
    },
    {
      id: "del-2", numero: 1002,
      estado: "en_camino",
      cliente: { nombre: "María García", telefono: "+54 11 3333-4444", direccion: "San Juan 567" },
      items: [{ nombre: "Empanadas x12", cantidad: 1, precio: 9500 }],
      total: 9500, metodoPago: "efectivo", tiempoEstimado: 35, createdAt: new Date(),
    },
    {
      id: "del-3", numero: 1003,
      estado: "recibido",
      cliente: { nombre: "Carlos López", telefono: "+54 11 5555-6666", direccion: "Lavalle 890" },
      items: [{ nombre: "Ñoquis", cantidad: 2, precio: 4500 }, { nombre: "Limonada", cantidad: 2, precio: 1500 }],
      total: 12000, metodoPago: "qr_mp", tiempoEstimado: 25, createdAt: new Date(),
    },
  ];

  const getEstadoColor = (estado: PedidoDelivery["estado"]) => {
    const colores: Record<string, string> = {
      recibido: "bg-blue-100 text-blue-800",
      confirmado: "bg-yellow-100 text-yellow-800",
      preparando: "bg-orange-100 text-orange-800",
      listo: "bg-green-100 text-green-800",
      en_camino: "bg-purple-100 text-purple-800",
      entregado: "bg-gray-100 text-gray-800",
    };
    return colores[estado];
  };

  const getEstadoLabel = (estado: PedidoDelivery["estado"]) => {
    const labels: Record<string, string> = {
      recibido: "📥 Recibido",
      confirmado: "✅ Confirmado",
      preparando: "🍳 Preparando",
      listo: "📦 Listo",
      en_camino: "🛵 En camino",
      entregado: "✓ Entregado",
    };
    return labels[estado];
  };

  const siguienteEstado: Record<string, PedidoDelivery["estado"]> = {
    recibido: "confirmado",
    confirmado: "preparando",
    preparando: "listo",
    listo: "en_camino",
    en_camino: "entregado",
  };

  const pedidosFiltrados = filtroEstado === "todos"
    ? pedidosMock
    : pedidosMock.filter((p) => p.estado === filtroEstado);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🛵 Pedidos Delivery</h1>
          <p className="text-gray-500">{pedidosMock.length} pedidos activos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {["todos", "recibido", "preparando", "listo", "en_camino"].map((estado) => (
          <Button
            key={estado}
            variant={filtroEstado === estado ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado(estado)}
            className={filtroEstado === estado ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {estado === "todos" ? "📋 Todos" : getEstadoLabel(estado as PedidoDelivery["estado"])}
          </Button>
        ))}
      </div>

      {/* Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <Card key={pedido.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-lg">#{pedido.numero}</span>
                  <span className="text-gray-400 ml-2">• {pedido.cliente.nombre}</span>
                </div>
                <Badge className={cn("text-xs", getEstadoColor(pedido.estado))}>
                  {getEstadoLabel(pedido.estado)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <p><strong>Dirección:</strong> {pedido.cliente.direccion}</p>
                <p><strong>Tel:</strong> {pedido.cliente.telefono}</p>
                <p><strong>Pago:</strong> {pedido.metodoPago}</p>
              </div>

              <div className="border-t pt-2 mb-3">
                {pedido.items.map((item, i) => (
                  <p key={i} className="text-sm">
                    {item.cantidad}x {item.nombre} - {formatCurrency(item.precio * item.cantidad)}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">{formatCurrency(pedido.total)}</span>
                <span className="text-sm text-gray-500">🕐 ~{pedido.tiempoEstimado} min</span>
              </div>

              {pedido.estado !== "entregado" && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => console.log(`Avanzar pedido ${pedido.id} a ${siguienteEstado[pedido.estado]}`)}
                >
                  {pedido.estado === "recibido" ? "✅ Confirmar" :
                   pedido.estado === "preparando" ? "📦 Marcar listo" :
                   pedido.estado === "listo" ? "🛵 Enviar" : "✓ Entregar"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
