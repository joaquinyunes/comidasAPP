"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

type MetodoPago = "efectivo" | "tarjeta_credito" | "tarjeta_debito" | "qr_mp" | "transferencia";

interface Pago {
  id: string;
  pedidoId: string;
  monto: number;
  propina: number;
  metodo: MetodoPago;
  estado: "pendiente" | "procesando" | "completado" | "fallido" | "reembolsado";
  comprobanteUrl?: string;
  mpPaymentId?: string;
  timestamp: Date;
}

interface CierreCaja {
  id: string;
  sucursalId: string;
  cajeroId: string;
  fechaApertura: Date;
  fechaCierre?: Date;
  montoInicial: number;
  montoFinal?: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalQR: number;
  totalTransferencia: number;
  totalGeneral: number;
  movimientos: MovimientoCaja[];
  estado: "abierta" | "cerrada";
}

interface MovimientoCaja {
  id: string;
  tipo: "ingreso" | "egreso" | "apertura" | "cierre" | "retiro";
  monto: number;
  metodo?: MetodoPago;
  descripcion: string;
  timestamp: Date;
}

// ============================================
// SERVICIO DE PAGOS (abstracción)
// ============================================

export class PagoService {
  private static instance: PagoService;

  static getInstance(): PagoService {
    if (!PagoService.instance) {
      PagoService.instance = new PagoService();
    }
    return PagoService.instance;
  }

  // Crear preferencia de pago MercadoPago
  async crearPreferenciaMercadoPago(data: {
    pedidoId: string;
    monto: number;
    descripcion: string;
    emailComprador: string;
  }): Promise<{ id: string; init_point: string }> {
    // En producción: llamar a API de MercadoPago
    const response = await fetch("/api/pagos/mercadopago/preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear preferencia de pago");
    }

    return response.json();
  }

  // Verificar estado de pago MercadoPago
  async verificarPagoMercadoPago(paymentId: string): Promise<Pago> {
    const response = await fetch(`/api/pagos/mercadopago/${paymentId}`);

    if (!response.ok) {
      throw new Error("Error al verificar pago");
    }

    return response.json();
  }

  // Crear pago con tarjeta (Stripe)
  async crearPagoStripe(data: {
    pedidoId: string;
    monto: number;
    currency: string;
    token: string;
  }): Promise<Pago> {
    const response = await fetch("/api/pagos/stripe/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al procesar pago con tarjeta");
    }

    return response.json();
  }

  // Reembolsar pago
  async reembolsarPago(pagoId: string, motivo: string): Promise<Pago> {
    const response = await fetch(`/api/pagos/${pagoId}/reembolsar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    if (!response.ok) {
      throw new Error("Error al reembolsar pago");
    }

    return response.json();
  }
}

// ============================================
// HOOK: usePagos
// ============================================

export function usePagos() {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const servicio = PagoService.getInstance();

  const procesarPago = useCallback(async (metodo: MetodoPago, datos: Record<string, unknown>) => {
    setProcesando(true);
    setError(null);

    try {
      let resultado: Pago;

      switch (metodo) {
        case "qr_mp":
          const preferencia = await servicio.crearPreferenciaMercadoPago(datos as { pedidoId: string; monto: number; descripcion: string; emailComprador: string });
          // Redirigir a MercadoPago
          window.location.href = preferencia.init_point;
          return;

        case "tarjeta_credito":
        case "tarjeta_debito":
          resultado = await servicio.crearPagoStripe(datos as { pedidoId: string; monto: number; currency: string; token: string });
          break;

        case "efectivo":
        case "transferencia":
          // Pago directo sin integración externa
          resultado = {
            id: crypto.randomUUID(),
            pedidoId: datos.pedidoId as string,
            monto: datos.monto as number,
            propina: (datos.propina as number) || 0,
            metodo,
            estado: "completado",
            timestamp: new Date(),
          };
          break;

        default:
          throw new Error(`Método de pago no soportado: ${metodo}`);
      }

      return resultado;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar pago");
      throw err;
    } finally {
      setProcesando(false);
    }
  }, [servicio]);

  const reembolsar = useCallback(async (pagoId: string, motivo: string) => {
    setProcesando(true);
    try {
      return await servicio.reembolsarPago(pagoId, motivo);
    } finally {
      setProcesando(false);
    }
  }, [servicio]);

  return { procesarPago, reembolsar, procesando, error };
}

// ============================================
// COMPONENTE: Modal Pago Completo
// ============================================

interface ModalPagoProps {
  pedidoId: string;
  total: number;
  onPagoCompletado: (pago: Pago) => void;
  onCerrar: () => void;
}

export function ModalPago({ pedidoId, total, onPagoCompletado, onCerrar }: ModalPagoProps) {
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [propinaPorcentaje, setPropinaPorcentaje] = useState(10);
  const [montoRecibido, setMontoRecibido] = useState("");
  const { procesarPago, procesando, error } = usePagos();

  const propina = total * (propinaPorcentaje / 100);
  const totalConPropina = total + propina;
  const vuelto = metodo === "efectivo" && montoRecibido
    ? Math.max(0, parseFloat(montoRecibido) - totalConPropina)
    : 0;

  const handlePagar = async () => {
    try {
      const pago = await procesarPago(metodo, {
        pedidoId,
        monto: totalConPropina,
        propina,
        moneda: "ARS",
      });

      if (pago) {
        onPagoCompletado(pago);
      }
    } catch {
      // Error ya manejado en el hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">💰 Cobrar Pedido</h2>
            <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Propina ({propinaPorcentaje}%)</span>
              <span>{formatCurrency(propina)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(totalConPropina)}</span>
            </div>
          </div>

          {/* Propina */}
          <div>
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
          <div>
            <p className="text-sm font-medium mb-2">Método de pago</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "efectivo" as MetodoPago, label: "💵 Efectivo", icon: "💵" },
                { value: "tarjeta_credito" as MetodoPago, label: "💳 Crédito", icon: "💳" },
                { value: "tarjeta_debito" as MetodoPago, label: "💳 Débito", icon: "💳" },
                { value: "qr_mp" as MetodoPago, label: "📱 QR MP", icon: "📱" },
                { value: "transferencia" as MetodoPago, label: "🏦 Transferencia", icon: "🏦" },
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
            <div>
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Botón pagar */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            onClick={handlePagar}
            disabled={procesando || (metodo === "efectivo" && (!montoRecibido || parseFloat(montoRecibido) < totalConPropina))}
          >
            {procesando ? "Procesando..." : `✅ Cobrar ${formatCurrency(totalConPropina)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Cierre de Caja
// ============================================

export function CierreCajaPanel() {
  const [caja, setCaja] = useState<CierreCaja>({
    id: "caja-1",
    sucursalId: "suc-1",
    cajeroId: "user-maria",
    fechaApertura: new Date(Date.now() - 8 * 60 * 60 * 1000),
    montoInicial: 50000,
    totalEfectivo: 320000,
    totalTarjeta: 180000,
    totalQR: 45000,
    totalTransferencia: 25000,
    totalGeneral: 570000,
    movimientos: [],
    estado: "abierta",
  });

  const totalEsperado = caja.montoInicial + caja.totalGeneral;
  const [montoFinal, setMontoFinal] = useState("");
  const diferencia = montoFinal ? parseFloat(montoFinal) - totalEsperado : 0;

  const handleCerrarCaja = () => {
    // En producción: enviar cierre a API
    console.log("Cerrando caja:", {
      ...caja,
      montoFinal: parseFloat(montoFinal),
      diferencia,
      fechaCierre: new Date(),
    });
    setCaja((prev) => ({ ...prev, estado: "cerrada" }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Monto inicial</p>
              <p className="font-medium">{formatCurrency(caja.montoInicial)}</p>
            </div>
            <div>
              <p className="text-gray-500">Apertura</p>
              <p className="font-medium">{caja.fechaApertura.toLocaleTimeString("es-AR")}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium">Totales por método</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">💵 Efectivo</span>
                <span>{formatCurrency(caja.totalEfectivo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">💳 Tarjeta</span>
                <span>{formatCurrency(caja.totalTarjeta)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">📱 QR</span>
                <span>{formatCurrency(caja.totalQR)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🏦 Transferencia</span>
                <span>{formatCurrency(caja.totalTransferencia)}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total general</span>
              <span>{formatCurrency(caja.totalGeneral)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Efectivo esperado (inicial + ventas)</span>
              <span>{formatCurrency(totalEsperado)}</span>
            </div>
          </div>

          {caja.estado === "abierta" && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Conteo final de efectivo</p>
                <Input
                  type="number"
                  placeholder="Ingrese el monto contado"
                  value={montoFinal}
                  onChange={(e) => setMontoFinal(e.target.value)}
                />
              </div>

              {montoFinal && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  diferencia === 0
                    ? "bg-green-50 text-green-700"
                    : diferencia > 0
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
                )}>
                  {diferencia === 0
                    ? "✅ Cajon cuadrado"
                    : diferencia > 0
                    ? `Sobrante: ${formatCurrency(diferencia)}`
                    : `Faltante: ${formatCurrency(Math.abs(diferencia))}`
                  }
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCerrarCaja}
                disabled={!montoFinal}
              >
                🔒 Cerrar Caja
              </Button>
            </div>
          )}

          {caja.estado === "cerrada" && (
            <div className="border-t pt-4">
              <Badge className="bg-green-100 text-green-800">Caja cerrada</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
