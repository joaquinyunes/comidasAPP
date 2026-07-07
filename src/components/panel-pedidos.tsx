"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import type { Pedido, PedidoEstado } from "@/types";

// ============================================
// PANEL DE PEDIDOS - Vista del Mozo/Gerente
// ============================================

interface PanelPedidosProps {
  onCerrarMesa?: (mesaId: string) => void;
}

export function PanelPedidos({ onCerrarMesa }: PanelPedidosProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("activo");
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: "ped-1",
      mesaId: "2",
      mozoId: "mozo-1",
      estado: "en_preparacion",
      tipo: "mesa",
      total: 31000,
      items: [
        { id: "i1", productoId: "p1", cantidad: 2, precioUnitario: 12500, subtotal: 25000, notas: "Sin cebolla", estado: "en_preparacion" },
        { id: "i2", productoId: "b1", cantidad: 2, precioUnitario: 2500, subtotal: 5000, notas: undefined, estado: "listo" },
      ],
      createdAt: new Date(Date.now() - 30 * 60000),
    },
    {
      id: "ped-2",
      mesaId: "5",
      mozoId: "mozo-2",
      estado: "esperando_cuenta",
      tipo: "mesa",
      total: 42000,
      items: [
        { id: "i3", productoId: "p2", cantidad: 1, precioUnitario: 14000, subtotal: 14000, notas: undefined, estado: "entregado" },
        { id: "i4", productoId: "pa1", cantidad: 2, precioUnitario: 9800, subtotal: 19600, notas: undefined, estado: "entregado" },
        { id: "i5", productoId: "b2", cantidad: 1, precioUnitario: 4500, subtotal: 4500, notas: undefined, estado: "entregado" },
      ],
      createdAt: new Date(Date.now() - 82 * 60000),
    },
    {
      id: "ped-3",
      mesaId: "8",
      mozoId: "mozo-1",
      estado: "recibido",
      tipo: "mesa",
      total: 35500,
      items: [
        { id: "i6", productoId: "pa2", cantidad: 3, precioUnitario: 10500, subtotal: 31500, notas: undefined, estado: "recibido" },
        { id: "i7", productoId: "b1", cantidad: 1, precioUnitario: 2500, subtotal: 2500, notas: undefined, estado: "recibido" },
        { id: "i8", productoId: "d1", cantidad: 1, precioUnitario: 5500, subtotal: 5500, notas: "Sin crema", estado: "recibido" },
      ],
      createdAt: new Date(Date.now() - 5 * 60000),
    },
  ]);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroEstado === "activo") return !["cerrado", "cancelado"].includes(p.estado);
    if (filtroEstado === "recibido") return p.estado === "recibido";
    if (filtroEstado === "preparando") return ["aceptado", "en_preparacion"].includes(p.estado);
    if (filtroEstado === "listo") return p.estado === "listo";
    if (filtroEstado === "cobrar") return p.estado === "esperando_cuenta";
    return true;
  });

  const handleEstadoChange = useCallback((pedidoId: string, nuevoEstado: PedidoEstado) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
    );
  }, []);

  const handleCerrarMesa = useCallback((mesaId: string) => {
    onCerrarMesa?.(mesaId);
  }, [onCerrarMesa]);

  const getEstadoColor = (estado: PedidoEstado) => {
    const colores: Record<PedidoEstado, string> = {
      recibido: "bg-blue-100 text-blue-800",
      aceptado: "bg-yellow-100 text-yellow-800",
      en_preparacion: "bg-orange-100 text-orange-800",
      listo: "bg-green-100 text-green-800",
      entregado: "bg-purple-100 text-purple-800",
      cerrado: "bg-gray-100 text-gray-800",
      cancelado: "bg-red-100 text-red-800",
      esperando_cuenta: "bg-red-100 text-red-800",
    };
    return colores[estado] || "bg-gray-100";
  };

  const getEstadoLabel = (estado: PedidoEstado) => {
    const labels: Record<PedidoEstado, string> = {
      recibido: "📥 Recibido",
      aceptado: "👨‍🍳 Aceptado",
      en_preparacion: "🔥 Preparando",
      listo: "✅ Listo",
      entregado: "🍽️ Entregado",
      cerrado: "🔒 Cerrado",
      cancelado: "❌ Cancelado",
      esperando_cuenta: "💰 Esperando cuenta",
    };
    return labels[estado] || estado;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-gray-500">Gestión de pedidos activos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {pedidos.filter((p) => !["cerrado", "cancelado"].includes(p.estado)).length} activos
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "activo", label: "📋 Activos" },
          { value: "recibido", label: "📥 Recibidos" },
          { value: "preparando", label: "🔥 Preparando" },
          { value: "listo", label: "✅ Listos" },
          { value: "cobrar", label: "💰 Por cobrar" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filtroEstado === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Lista de pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <Card key={pedido.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mesa {pedido.mesaId}</CardTitle>
                <Badge className={getEstadoColor(pedido.estado)}>
                  {getEstadoLabel(pedido.estado)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {pedido.items.length} items • {formatTime(pedido.createdAt)}
              </p>
            </CardHeader>
            <CardContent>
              {/* Items */}
              <div className="space-y-1 mb-4">
                {pedido.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className={cn(
                      item.estado === "listo" || item.estado === "entregado"
                        ? "line-through text-gray-400"
                        : ""
                    )}>
                      {item.cantidad}x Item {item.productoId.slice(-1)}
                      {item.notas && (
                        <span className="text-orange-500 text-xs ml-1">
                          ({item.notas})
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500">
                      ${item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold mb-4 pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(pedido.total)}</span>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 flex-wrap">
                {pedido.estado === "recibido" && (
                  <Button
                    size="sm"
                    onClick={() => handleEstadoChange(pedido.id, "en_preparacion")}
                  >
                    🔥 Iniciar preparación
                  </Button>
                )}
                {pedido.estado === "en_preparacion" && (
                  <Button
                    size="sm"
                    onClick={() => handleEstadoChange(pedido.id, "listo")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✅ Marcar listo
                  </Button>
                )}
                {pedido.estado === "listo" && (
                  <Button
                    size="sm"
                    onClick={() => handleEstadoChange(pedido.id, "entregado")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    🍽️ Entregado
                  </Button>
                )}
                {pedido.estado === "entregado" && (
                  <Button
                    size="sm"
                    onClick={() => handleEstadoChange(pedido.id, "esperando_cuenta")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    💰 Esperando cuenta
                  </Button>
                )}
                {pedido.estado === "esperando_cuenta" && (
                  <Button
                    size="sm"
                    onClick={() => pedido.mesaId && handleCerrarMesa(pedido.mesaId)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✅ Cobrar y cerrar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p>No hay pedidos con este filtro</p>
        </div>
      )}
    </div>
  );
}
