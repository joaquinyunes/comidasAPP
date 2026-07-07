"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTime } from "@/lib/utils";
import type { KDSPedido, PedidoEstado } from "@/types";

// ============================================
// KDS COMPLETO - Kitchen Display System
// ============================================

interface KDSCompletoProps {
  tipo: "cocina" | "barra";
  sucursalId: string;
  onItemListo?: (pedidoId: string, itemId: string) => void;
  onPedidoListo?: (pedidoId: string) => void;
}

export function KDSCompleto({
  tipo,
  sucursalId,
  onItemListo,
  onPedidoListo,
}: KDSCompletoProps) {
  const [pedidos, setPedidos] = useState<KDSPedido[]>([]);
  const [filtro, setFiltro] = useState<"todos" | "urgentes" | "recientes">("todos");

  // Pedidos de ejemplo
  useEffect(() => {
    const pedidosEjemplo: KDSPedido[] = tipo === "cocina" ? [
      {
        id: "ped-1",
        mesaNumero: "2",
        sector: "Salón",
        mozo: "Carlos",
        tiempoEspera: 12,
        prioridad: "normal",
        items: [
          { id: "i1", nombre: "Pizza Napolitana", cantidad: 2, notas: "Sin cebolla", alergenos: ["gluten", "lactosa"], estado: "en_preparacion" },
          { id: "i2", nombre: "Ñoquis Caseros", cantidad: 1, notas: undefined, alergenos: ["gluten", "huevo"], estado: "recibido" },
        ],
      },
      {
        id: "ped-2",
        mesaNumero: "5",
        sector: "Terraza",
        mozo: "María",
        tiempoEspera: 22,
        prioridad: "urgente",
        items: [
          { id: "i3", nombre: "Pizza Fugazzeta", cantidad: 1, notas: "Bien cocida", alergenos: ["gluten", "lactosa"], estado: "en_preparacion" },
          { id: "i4", nombre: "Ensalada Caesar", cantidad: 1, notas: "Sin crutones (alergia gluten)", alergenos: ["gluten"], estado: "listo" },
        ],
      },
      {
        id: "ped-3",
        mesaNumero: "8",
        sector: "Salón",
        mozo: "Carlos",
        tiempoEspera: 5,
        prioridad: "normal",
        items: [
          { id: "i5", nombre: "Tallarines a la Bolognesa", cantidad: 3, notas: undefined, alergenos: ["gluten", "huevo"], estado: "recibido" },
        ],
      },
    ] : [
      {
        id: "ped-4",
        mesaNumero: "2",
        sector: "Salón",
        mozo: "Carlos",
        tiempoEspera: 3,
        prioridad: "normal",
        items: [
          { id: "i6", nombre: "Coca-Cola 500ml", cantidad: 2, notas: undefined, alergenos: [], estado: "recibido" },
          { id: "i7", nombre: "Cerveza Artesanal IPA", cantidad: 1, notas: undefined, alergenos: ["gluten"], estado: "recibido" },
        ],
      },
    ];

    setPedidos(pedidosEjemplo);
  }, [tipo]);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "urgentes") return p.prioridad === "urgente" || p.tiempoEspera > 15;
    if (filtro === "recientes") return p.tiempoEspera < 10;
    return true;
  });

  const handleItemListo = useCallback((pedidoId: string, itemId: string) => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId
          ? {
              ...p,
              items: p.items.map((item) =>
                item.id === itemId ? { ...item, estado: "listo" as PedidoEstado } : item
              ),
            }
          : p
      )
    );
    onItemListo?.(pedidoId, itemId);
  }, [onItemListo]);

  const handlePedidoListo = useCallback((pedidoId: string) => {
    onPedidoListo?.(pedidoId);
    setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
  }, [onPedidoListo]);

  const todosItemsListos = (pedido: KDSPedido) =>
    pedido.items.every((item) => item.estado === "listo");

  const pedidosUrgentes = pedidos.filter(
    (p) => p.prioridad === "urgente" || p.tiempoEspera > 15
  ).length;

  return (
    <div className={cn(
      "min-h-screen p-4",
      tipo === "cocina" ? "bg-gray-900 text-white" : "bg-gray-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {tipo === "cocina" ? "👨‍🍳 Cocina" : "🍹 Barra"}
          </h1>
          {pedidosUrgentes > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 {pedidosUrgentes} urgentes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            { new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Badge variant="secondary">
            {pedidos.length} pedidos activos
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {(["todos", "urgentes", "recientes"] as const).map((f) => (
          <Button
            key={f}
            variant={filtro === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro(f)}
            className={tipo === "cocina" && filtro !== f ? "border-gray-700 text-gray-300" : ""}
          >
            {f === "todos" && "📋 Todos"}
            {f === "urgentes" && "🔴 Urgentes"}
            {f === "recientes" && "⏱️ Recientes"}
          </Button>
        ))}
      </div>

      {/* Grid de pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <PedidoKDSCard
            key={pedido.id}
            pedido={pedido}
            tipo={tipo}
            onItemListo={handleItemListo}
            onPedidoListo={handlePedidoListo}
            todosListos={todosItemsListos(pedido)}
          />
        ))}
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-4">{tipo === "cocina" ? "👨‍🍳" : "🍹"}</p>
          <p className="text-xl">
            {filtro === "urgentes"
              ? "No hay pedidos urgentes"
              : "No hay pedidos pendientes"}
          </p>
          <p className="text-sm mt-2">
            Los nuevos pedidos aparecerán aquí automáticamente
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TARJETA DE PEDIDO KDS
// ============================================

interface PedidoKDSCardProps {
  pedido: KDSPedido;
  tipo: "cocina" | "barra";
  onItemListo: (pedidoId: string, itemId: string) => void;
  onPedidoListo: (pedidoId: string) => void;
  todosListos: boolean;
}

function PedidoKDSCard({
  pedido,
  tipo,
  onItemListo,
  onPedidoListo,
  todosListos,
}: PedidoKDSCardProps) {
  const [tiempo, setTiempo] = useState(pedido.tiempoEspera);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempo((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const esUrgente = tiempo > 15 || pedido.prioridad === "urgente";
  const esMuyUrgente = tiempo > 20;

  return (
    <Card className={cn(
      "transition-all",
      esMuyUrgente && "border-red-600 shadow-lg shadow-red-500/20 animate-pulse",
      esUrgente && !esMuyUrgente && "border-yellow-500 shadow-lg",
      tipo === "cocina" && "bg-gray-800 border-gray-700 text-white"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Mesa {pedido.mesaNumero}
          </CardTitle>
          <div className="flex items-center gap-2">
            {esUrgente && (
              <Badge variant="destructive">
                {esMuyUrgente ? "🔥 MUY URGENTE" : "⚠️ URGENTE"}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "font-mono",
                esMuyUrgente ? "text-red-400 border-red-500" :
                esUrgente ? "text-yellow-400 border-yellow-500" :
                tipo === "cocina" ? "text-gray-300 border-gray-600" : ""
              )}
            >
              ⏱️ {tiempo} min
            </Badge>
          </div>
        </div>
        <p className={cn(
          "text-xs",
          tipo === "cocina" ? "text-gray-400" : "text-gray-500"
        )}>
          {pedido.sector} • {pedido.mozo}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pedido.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-colors",
                item.estado === "listo"
                  ? "bg-green-900/30 border border-green-700"
                  : tipo === "cocina" ? "bg-gray-700" : "bg-gray-100"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {item.cantidad}x {item.nombre}
                  </span>
                  {item.alergenos && item.alergenos.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      ⚠️ {item.alergenos.join(", ")}
                    </Badge>
                  )}
                  {item.estado === "listo" && (
                    <Badge className="bg-green-600 text-xs">✓ Listo</Badge>
                  )}
                </div>
                {item.notas && (
                  <p className={cn(
                    "text-xs mt-1",
                    item.notas.includes("alergia") || item.notas.includes("sin")
                      ? "text-orange-400 font-semibold"
                      : tipo === "cocina" ? "text-gray-400" : "text-gray-500"
                  )}>
                    📝 {item.notas}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => onItemListo(pedido.id, item.id)}
                disabled={item.estado === "listo"}
                className={cn(
                  "ml-2 flex-shrink-0",
                  item.estado === "listo"
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {item.estado === "listo" ? "✓" : "Listo"}
              </Button>
            </div>
          ))}
        </div>

        {/* Botón pedido listo */}
        {todosListos && (
          <Button
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onPedidoListo(pedido.id)}
          >
            ✅ Pedido completo — Entregar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
