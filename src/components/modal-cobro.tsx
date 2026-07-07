"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import type { Pedido } from "@/types";

// ============================================
// MODAL DE COBRO
// ============================================

interface ModalCobroProps {
  pedido: Pedido;
  onCobrar: (metodo: string, propina: number) => void;
  onCerrar: () => void;
}

export function ModalCobro({ pedido, onCobrar, onCerrar }: ModalCobroProps) {
  const [metodo, setMetodo] = useState("efectivo");
  const [propinaPorcentaje, setPropinaPorcentaje] = useState(10);
  const [montoRecibido, setMontoRecibido] = useState("");

  const subtotal = pedido.total;
  const propina = subtotal * (propinaPorcentaje / 100);
  const total = subtotal + propina;
  const vuelto = metodo === "efectivo" && montoRecibido
    ? Math.max(0, parseFloat(montoRecibido) - total)
    : 0;

  const handleCobrar = () => {
    onCobrar(metodo, propina);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">💰 Cobrar Mesa {pedido.mesaId}</h2>
            <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
        </div>

        {/* Resumen */}
        <div className="p-6">
          <div className="space-y-2 mb-4">
            {pedido.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.cantidad}x Item</span>
                <span className="text-gray-500">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Propina ({propinaPorcentaje}%)</span>
              <span>{formatCurrency(propina)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Propina */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Propina</p>
            <div className="flex gap-2">
              {[0, 5, 10, 15, 20].map((pct) => (
                <Button
                  key={pct}
                  variant={propinaPorcentaje === pct ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPropinaPorcentaje(pct)}
                  className={propinaPorcentaje === pct ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          {/* Método de pago */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Método de pago</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "efectivo", label: "💵 Efectivo" },
                { value: "tarjeta_credito", label: "💳 Crédito" },
                { value: "tarjeta_debito", label: "💳 Débito" },
                { value: "qr", label: "📱 QR" },
              ].map((m) => (
                <Button
                  key={m.value}
                  variant={metodo === m.value ? "default" : "outline"}
                  onClick={() => setMetodo(m.value)}
                  className={cn(
                    "justify-start",
                    metodo === m.value && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Monto recibido (solo efectivo) */}
          {metodo === "efectivo" && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Monto recibido</p>
              <Input
                type="number"
                placeholder="0"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
              />
              {vuelto > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Vuelto: {formatCurrency(vuelto)}
                </p>
              )}
            </div>
          )}

          {/* Botón cobrar */}
          <Button
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-lg py-6"
            onClick={handleCobrar}
          >
            ✅ Cobrar {formatCurrency(total)}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE DE COBRO RÁPIDO
// ============================================

interface CobroRapidoProps {
  mesaId: string;
  total: number;
  onCobrar: (metodo: string) => void;
}

export function CobroRapido({ mesaId, total, onCobrar }: CobroRapidoProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Mesa {mesaId}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-center mb-4">{formatCurrency(total)}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onCobrar("efectivo")}>
            💵 Efectivo
          </Button>
          <Button variant="outline" onClick={() => onCobrar("tarjeta")}>
            💳 Tarjeta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
