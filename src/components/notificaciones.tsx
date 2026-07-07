"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

interface Notificacion {
  id: string;
  tipo: "pedido" | "stock" | "reserva" | "sistema" | "alerta";
  titulo: string;
  mensaje: string;
  leida: boolean;
  timestamp: Date;
  accion?: { label: string; onClick: () => void };
}

export function SistemaNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: "n1",
      tipo: "pedido",
      titulo: "Pedido listo",
      mensaje: "Mesa 2 — 2 Pizzas Napolitana listas para entregar",
      leida: false,
      timestamp: new Date(Date.now() - 2 * 60000),
      accion: { label: "Ver pedido", onClick: () => {} },
    },
    {
      id: "n2",
      tipo: "alerta",
      titulo: "Pedido demorado",
      mensaje: "Mesa 5 lleva 22 minutos esperando",
      leida: false,
      timestamp: new Date(Date.now() - 5 * 60000),
      accion: { label: "Verificar", onClick: () => {} },
    },
    {
      id: "n3",
      tipo: "stock",
      titulo: "Stock bajo",
      mensaje: "Mozzarella quedan solo 2 kg",
      leida: false,
      timestamp: new Date(Date.now() - 15 * 60000),
      accion: { label: "Ver stock", onClick: () => {} },
    },
    {
      id: "n4",
      tipo: "reserva",
      titulo: "Nueva reserva",
      mensaje: "Familia García — 6 personas — 21:00 — Cumpleaños",
      leida: true,
      timestamp: new Date(Date.now() - 30 * 60000),
    },
    {
      id: "n5",
      tipo: "sistema",
      titulo: "Caja abierta",
      mensaje: "Caja del turno noche abierta por Carlos",
      leida: true,
      timestamp: new Date(Date.now() - 60 * 60000),
    },
  ]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const handleMarcarLeida = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const handleMarcarTodasLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const getTipoIcon = (tipo: Notificacion["tipo"]) => {
    const iconos: Record<Notificacion["tipo"], string> = {
      pedido: "📋",
      stock: "📦",
      reserva: "📅",
      sistema: "⚙️",
      alerta: "⚠️",
    };
    return iconos[tipo];
  };

  const getTipoColor = (tipo: Notificacion["tipo"]) => {
    const colores: Record<Notificacion["tipo"], string> = {
      pedido: "bg-blue-100 text-blue-800",
      stock: "bg-yellow-100 text-yellow-800",
      reserva: "bg-green-100 text-green-800",
      sistema: "bg-gray-100 text-gray-800",
      alerta: "bg-red-100 text-red-800",
    };
    return colores[tipo];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          🔔 Notificaciones
          {noLeidas > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
              {noLeidas}
            </Badge>
          )}
        </h3>
        {noLeidas > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarcarTodasLeidas}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notificaciones.map((notif) => (
          <Card
            key={notif.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-gray-50",
              !notif.leida && "border-l-4 border-l-red-500 bg-red-50/50"
            )}
            onClick={() => handleMarcarLeida(notif.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">{getTipoIcon(notif.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{notif.titulo}</span>
                    <Badge className={cn("text-xs", getTipoColor(notif.tipo))}>
                      {notif.tipo}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.mensaje}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {notif.timestamp.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {notif.accion && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          notif.accion?.onClick();
                        }}
                      >
                        {notif.accion.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
