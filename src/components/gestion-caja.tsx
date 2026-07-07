"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// GESTIÓN DE CAJA
// ============================================

interface MovimientoCaja {
  id: string;
  tipo: "ingreso" | "egreso" | "apertura" | "cierre";
  descripcion: string;
  monto: number;
  metodo?: string;
  timestamp: Date;
}

interface EstadoCaja {
  abierta: boolean;
  montoInicial: number;
  movimientos: MovimientoCaja[];
  totalIngresos: number;
  totalEgresos: number;
}

export function GestionCaja() {
  const [caja, setCaja] = useState<EstadoCaja>({
    abierta: false,
    montoInicial: 0,
    movimientos: [],
    totalIngresos: 0,
    totalEgresos: 0,
  });
  const [montoApertura, setMontoApertura] = useState("");
  const [showApertura, setShowApertura] = useState(false);

  const saldoActual = caja.montoInicial + caja.totalIngresos - caja.totalEgresos;

  const handleAbrirCaja = () => {
    const monto = parseFloat(montoApertura) || 0;
    if (monto <= 0) return;

    setCaja({
      abierta: true,
      montoInicial: monto,
      movimientos: [
        {
          id: crypto.randomUUID(),
          tipo: "apertura",
          descripcion: "Apertura de caja",
          monto,
          timestamp: new Date(),
        },
      ],
      totalIngresos: 0,
      totalEgresos: 0,
    });
    setShowApertura(false);
    setMontoApertura("");
  };

  const handleCerrarCaja = () => {
    setCaja((prev) => ({
      ...prev,
      abierta: false,
      movimientos: [
        ...prev.movimientos,
        {
          id: crypto.randomUUID(),
          tipo: "cierre",
          descripcion: "Cierre de caja",
          monto: saldoActual,
          timestamp: new Date(),
        },
      ],
    }));
  };

  const handleCobro = useCallback((monto: number, metodo: string) => {
    const movimiento: MovimientoCaja = {
      id: crypto.randomUUID(),
      tipo: "ingreso",
      descripcion: `Cobro ${metodo}`,
      monto,
      metodo,
      timestamp: new Date(),
    };
    setCaja((prev) => ({
      ...prev,
      movimientos: [...prev.movimientos, movimiento],
      totalIngresos: prev.totalIngresos + monto,
    }));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Caja</h1>
          <p className="text-gray-500">Gestión de cobros y arqueo</p>
        </div>
        <Badge variant={caja.abierta ? "default" : "secondary"}>
          {caja.abierta ? "🟢 Abierta" : "🔴 Cerrada"}
        </Badge>
      </div>

      {/* Estado de la caja */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo de caja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className={cn(
              "text-4xl font-bold",
              saldoActual >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(saldoActual)}
            </p>
            {caja.abierta && (
              <p className="text-sm text-gray-500 mt-1">
                Apertura: {formatCurrency(caja.montoInicial)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(caja.totalIngresos)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Egresos</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(caja.totalEgresos)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Movimientos</p>
              <p className="text-lg font-bold">
                {caja.movimientos.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      {!caja.abierta ? (
        <Card>
          <CardContent className="p-6">
            {showApertura ? (
              <div className="space-y-4">
                <p className="font-medium">Monto de apertura</p>
                <Input
                  type="number"
                  placeholder="Ingrese el monto inicial"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowApertura(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAbrirCaja} className="flex-1 bg-green-600 hover:bg-green-700">
                    Abrir caja
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowApertura(true)} className="w-full">
                🔓 Abrir caja
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
            ➕ Egreso
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleCerrarCaja}
          >
            🔒 Cerrar caja
          </Button>
        </div>
      )}

      {/* Movimientos */}
      {caja.movimientos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caja.movimientos.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {mov.tipo === "ingreso" ? "💰" : mov.tipo === "egreso" ? "💸" : mov.tipo === "apertura" ? "🔓" : "🔒"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{mov.descripcion}</p>
                      <p className="text-xs text-gray-500">
                        {mov.timestamp.toLocaleTimeString("es-AR")}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-medium",
                    mov.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                  )}>
                    {mov.tipo === "ingreso" ? "+" : "-"}{formatCurrency(mov.monto)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
