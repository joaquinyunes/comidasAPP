"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  activa: boolean;
  metricas: MetricasSucursal;
}

interface MetricasSucursal {
  ventasHoy: number;
  ventasAyer: number;
  pedidosHoy: number;
  ticketPromedio: number;
  mesasOcupadas: number;
  mesasTotales: number;
  empleadosActivos: number;
  stockCritico: number;
}

// ============================================
// VISTA CENTRAL (TODAS LAS SUCURSALES)
// ============================================

export function ControlCentral() {
  const [periodo, setPeriodo] = useState("hoy");

  const sucursales: Sucursal[] = [
    {
      id: "suc-1",
      nombre: "Sucursal Principal",
      direccion: "Av. Corrientes 1234",
      telefono: "+54 11 1234-5678",
      activa: true,
      metricas: {
        ventasHoy: 1250000,
        ventasAyer: 1100000,
        pedidosHoy: 89,
        ticketPromedio: 14045,
        mesasOcupadas: 12,
        mesasTotales: 18,
        empleadosActivos: 8,
        stockCritico: 2,
      },
    },
    {
      id: "suc-2",
      nombre: "Sucursal Norte",
      direccion: "Av. Santa Fe 5678",
      telefono: "+54 11 9876-5432",
      activa: true,
      metricas: {
        ventasHoy: 890000,
        ventasAyer: 920000,
        pedidosHoy: 62,
        ticketPromedio: 14354,
        mesasOcupadas: 8,
        mesasTotales: 14,
        empleadosActivos: 6,
        stockCritico: 0,
      },
    },
    {
      id: "suc-3",
      nombre: "Sucursal Sur",
      direccion: "Av. Rivadavia 9012",
      telefono: "+54 11 5555-1234",
      activa: false,
      metricas: {
        ventasHoy: 0,
        ventasAyer: 650000,
        pedidosHoy: 0,
        ticketPromedio: 0,
        mesasOcupadas: 0,
        mesasTotales: 10,
        empleadosActivos: 0,
        stockCritico: 5,
      },
    },
  ];

  const totalVentas = sucursales.reduce((sum, s) => sum + s.metricas.ventasHoy, 0);
  const totalPedidos = sucursales.reduce((sum, s) => sum + s.metricas.pedidosHoy, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Control Central</h1>
          <p className="text-gray-500">Vista consolidada de todas las sucursales</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={(v) => { if (v) setPeriodo(v) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">📥 Exportar</Button>
        </div>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalVentas)}</p>
            <p className="text-sm text-gray-500">Ventas totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
            <p className="text-sm text-gray-500">Pedidos totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sucursales.filter((s) => s.activa).length}/{sucursales.length}</p>
            <p className="text-sm text-gray-500">Sucursales activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {sucursales.reduce((sum, s) => sum + s.metricas.stockCritico, 0)}
            </p>
            <p className="text-sm text-gray-500">Stock crítico</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards por sucursal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sucursales.map((sucursal) => {
          const cambioVentas = sucursal.metricas.ventasAyer > 0
            ? ((sucursal.metricas.ventasHoy - sucursal.metricas.ventasAyer) / sucursal.metricas.ventasAyer) * 100
            : 0;

          return (
            <Card key={sucursal.id} className={cn("hover:shadow-md transition-shadow", !sucursal.activa && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{sucursal.nombre}</h3>
                      <Badge variant={sucursal.activa ? "default" : "secondary"}>
                        {sucursal.activa ? "🟢 Activa" : "🔴 Inactiva"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{sucursal.direccion}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Ventas hoy</p>
                    <p className="font-bold">{formatCurrency(sucursal.metricas.ventasHoy)}</p>
                    {cambioVentas !== 0 && (
                      <p className={cn("text-xs", cambioVentas > 0 ? "text-green-600" : "text-red-600")}>
                        {cambioVentas > 0 ? "↑" : "↓"} {Math.abs(cambioVentas).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500">Pedidos</p>
                    <p className="font-bold">{sucursal.metricas.pedidosHoy}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ticket promedio</p>
                    <p className="font-bold">{formatCurrency(sucursal.metricas.ticketPromedio)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mesas</p>
                    <p className="font-bold">
                      {sucursal.metricas.mesasOcupadas}/{sucursal.metricas.mesasTotales}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Empleados</p>
                    <p className="font-bold">{sucursal.metricas.empleadosActivos}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock crítico</p>
                    <p className={cn("font-bold", sucursal.metricas.stockCritico > 0 && "text-red-600")}>
                      {sucursal.metricas.stockCritico}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">📊 Detalle</Button>
                  <Button variant="outline" size="sm" className="flex-1">⚙️ Config</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPARATIVA DE SUCURSALES
// ============================================

export function ComparativaSucursales() {
  const sucursales = [
    { nombre: "Principal", ventas: 1250000, pedidos: 89, ticket: 14045, crecimiento: 12 },
    { nombre: "Norte", ventas: 890000, pedidos: 62, ticket: 14354, crecimiento: -3 },
    { nombre: "Sur", ventas: 650000, pedidos: 45, ticket: 14444, crecimiento: 8 },
  ];

  const maxVentas = Math.max(...sucursales.map((s) => s.ventas));

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Comparativa de Sucursales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sucursales.map((suc) => (
          <div key={suc.nombre} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{suc.nombre}</span>
              <span className={cn("text-sm", suc.crecimiento > 0 ? "text-green-600" : "text-red-600")}>
                {suc.crecimiento > 0 ? "↑" : "↓"} {Math.abs(suc.crecimiento)}%
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(suc.ventas / maxVentas) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatCurrency(suc.ventas)}</span>
              <span>{suc.pedidos} pedidos • Ticket: {formatCurrency(suc.ticket)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
