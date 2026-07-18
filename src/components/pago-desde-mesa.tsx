"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { Pedido } from "@/types";

// ============================================
// PAGO DESDE LA MESA - WebSocket en tiempo real
// ============================================

type MetodoPago = "efectivo" | "tarjeta" | "qr";

interface PagoDesdeMesaProps {
  pedido: Pedido;
  onPagoCompletado?: (pagoId: string) => void;
}

export function PagoDesdeMesa({ pedido, onPagoCompletado }: PagoDesdeMesaProps) {
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [propina, setPropina] = useState<number>(0);
  const [montoEfectivo, setMontoEfectivo] = useState<string>("");
  const [procesando, setProcesando] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const subtotal = pedido.total;
  const propinaMonto = subtotal * (propina / 100);
  const totalConPropina = subtotal + propinaMonto;
  const vuelto = metodo === "efectivo" && montoEfectivo
    ? Math.max(0, parseFloat(montoEfectivo) - totalConPropina)
    : 0;

  useEffect(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/pagos`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ tipo: "pago:suscribir", pedidoId: pedido.id }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.tipo === "pago:confirmado" && msg.pedidoId === pedido.id) {
            setPagoExitoso(true);
            setProcesando(false);
            onPagoCompletado?.(msg.pagoId);
          } else if (msg.tipo === "pago:error" && msg.pedidoId === pedido.id) {
            setError(msg.mensaje || "Error al procesar pago");
            setProcesando(false);
          }
        } catch {}
      };

      ws.onclose = () => {
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            wsRef.current = new WebSocket(`${protocol}//${window.location.host}/ws/pagos`);
          }
        }, 5000);
      };
    } catch {}

    return () => { wsRef.current?.close(); };
  }, [pedido.id, onPagoCompletado]);

  const handlePagar = async () => {
    if (metodo === "efectivo" && (!montoEfectivo || parseFloat(montoEfectivo) < totalConPropina)) {
      setError("El monto en efectivo debe ser mayor o igual al total");
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: pedido.id,
          metodo,
          monto: totalConPropina,
          propina: propinaMonto,
          montoEfectivo: metodo === "efectivo" ? parseFloat(montoEfectivo) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al procesar pago");
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          tipo: "pago:procesar",
          pedidoId: pedido.id,
          metodo,
          monto: totalConPropina,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar pago");
      setProcesando(false);
    }
  };

  if (pagoExitoso) {
    return (
      <Card className="border-green-500 bg-green-50">
        <CardContent className="p-8 text-center">
          <p className="text-6xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Pago confirmado</h2>
          <p className="text-green-600">
            Mesa {pedido.mesaNumero} — {formatCurrency(totalConPropina)}
          </p>
          {propina > 0 && (
            <p className="text-sm text-green-500 mt-1">
              Incluye {propina}% de propina ({formatCurrency(propinaMonto)})
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pago — Mesa {pedido.mesaNumero}</CardTitle>
          <Badge variant="outline">{pedido.items.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {pedido.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.cantidad}x {item.productoNombre}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <p className="text-sm font-medium mb-2">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {(["efectivo", "tarjeta", "qr"] as MetodoPago[]).map((m) => (
              <Button
                key={m}
                variant={metodo === m ? "default" : "outline"}
                onClick={() => setMetodo(m)}
                className="h-14"
              >
                {m === "efectivo" ? "💵 Efectivo" : m === "tarjeta" ? "💳 Tarjeta" : "📱 QR"}
              </Button>
            ))}
          </div>
        </div>

        {/* Propina */}
        <div>
          <p className="text-sm font-medium mb-2">Propina</p>
          <div className="flex gap-2">
            {[0, 5, 10, 15].map((p) => (
              <Button
                key={p}
                variant={propina === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPropina(p)}
              >
                {p === 0 ? "Sin propina" : `${p}%`}
              </Button>
            ))}
          </div>
        </div>

        {/* Monto efectivo */}
        {metodo === "efectivo" && (
          <div>
            <p className="text-sm font-medium mb-2">Monto recibido</p>
            <Input
              type="number"
              placeholder={totalConPropina.toFixed(2)}
              value={montoEfectivo}
              onChange={(e) => { setMontoEfectivo(e.target.value); setError(null); }}
            />
            {vuelto > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Vuelto: {formatCurrency(vuelto)}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        {/* Total y botón */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total a pagar</span>
            <span className="text-red-600">{formatCurrency(totalConPropina)}</span>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
            onClick={handlePagar}
            disabled={procesando}
          >
            {procesando ? "Procesando..." : `Pagar ${formatCurrency(totalConPropina)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
