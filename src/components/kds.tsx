"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KDSPedido, PedidoEstado } from "@/types";

// ============================================
// KDS - Kitchen Display System
// ============================================

interface KDSProps {
  tipo: "cocina" | "barra";
  onItemListo?: (pedidoId: string, itemId: string) => void;
}

export function KDS({ tipo, onItemListo }: KDSProps) {
  const [pedidos, setPedidos] = useState<KDSPedido[]>([]);

  // Simular pedidos (en producción vendría de WebSocket)
  useEffect(() => {
    // TODO: Conectar a WebSocket para recibir pedidos en tiempo real
  }, []);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (tipo === "barra") {
      return p.items.some((item) =>
        item.nombre.toLowerCase().includes("cerveza") ||
        item.nombre.toLowerCase().includes("vino") ||
        item.nombre.toLowerCase().includes("trago") ||
        item.nombre.toLowerCase().includes("gaseosa")
      );
    }
    return true;
  });

  return (
    <div className={cn(
      "min-h-screen p-4",
      tipo === "cocina" ? "bg-gray-900 text-white" : "bg-gray-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {tipo === "cocina" ? "👨‍🍳 Cocina" : "🍹 Barra"}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            { new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Badge variant="secondary">
            {pedidosFiltrados.length} pedidos
          </Badge>
        </div>
      </div>

      {/* Grid de pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            onItemListo={onItemListo}
          />
        ))}
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-4">👨‍🍳</p>
          <p className="text-xl">No hay pedidos pendientes</p>
          <p className="text-sm">Los nuevos pedidos aparecerán aquí automáticamente</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TARJETA DE PEDIDO KDS
// ============================================

interface PedidoCardProps {
  pedido: KDSPedido;
  onItemListo?: (pedidoId: string, itemId: string) => void;
}

function PedidoCard({ pedido, onItemListo }: PedidoCardProps) {
  const [tiempo, setTiempo] = useState(pedido.tiempoEspera);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempo((t) => t + 1);
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const esUrgente = tiempo > 15 || pedido.prioridad === "urgente";

  return (
    <Card className={cn(
      "transition-all",
      esUrgente && "border-red-500 shadow-lg animate-pulse"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Mesa {pedido.mesaNumero}
          </CardTitle>
          <div className="flex items-center gap-2">
            {esUrgente && (
              <Badge variant="destructive">URGENTE</Badge>
            )}
            <Badge variant="outline">
              ⏱️ {tiempo} min
            </Badge>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {pedido.sector} • {pedido.mozo}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pedido.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg",
                item.estado === "listo" ? "bg-green-100" : "bg-gray-50"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {item.cantidad}x {item.nombre}
                  </span>
                  {item.alergenos && item.alergenos.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      ⚠️ {item.alergenos.join(", ")}
                    </Badge>
                  )}
                </div>
                {item.notas && (
                  <p className="text-xs text-orange-600 mt-1">
                    📝 {item.notas}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant={item.estado === "listo" ? "outline" : "default"}
                onClick={() => onItemListo?.(pedido.id, item.id)}
                disabled={item.estado === "listo"}
                className={cn(
                  item.estado === "listo"
                    ? "bg-green-500 text-white"
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                {item.estado === "listo" ? "✓ Listo" : "Listo"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
