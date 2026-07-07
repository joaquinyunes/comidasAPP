"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// KPIs CARD
// ============================================

interface KPICardProps {
  titulo: string;
  valor: string | number;
  cambio?: number;
  icono: string;
  color?: string;
}

function KPICard({ titulo, valor, cambio, icono, color = "text-gray-900" }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{titulo}</p>
            <p className={cn("text-2xl font-bold", color)}>{valor}</p>
            {cambio !== undefined && (
              <p className={cn("text-xs", cambio >= 0 ? "text-green-600" : "text-red-600")}>
                {cambio >= 0 ? "↑" : "↓"} {Math.abs(cambio)}% vs ayer
              </p>
            )}
          </div>
          <span className="text-3xl">{icono}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// GRÁFICO SIMPLE (BARRAS CSS)
// ============================================

interface BarraData {
  label: string;
  value: number;
  color?: string;
}

function GraficoBarras({ data, titulo }: { data: BarraData[]; titulo: string }) {
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm w-24 text-right text-gray-500">{item.label}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", item.color || "bg-red-500")}
                  style={{ width: `${(item.value / maxVal) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-16">{item.value.toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// GRÁFICO LÍNEA SIMPLE (CSS)
// ============================================

function GraficoLineaSimple({ data, titulo }: { data: number[]; titulo: string }) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {data.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-red-500 rounded-t"
              style={{ height: `${((val - minVal) / range) * 100}%`, minHeight: "4px" }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// TABLA TOP PRODUCTOS
// ============================================

interface ProductoTop {
  nombre: string;
  cantidad: number;
  total: number;
  tendencia: number;
}

function TopProductos({ productos }: { productos: ProductoTop[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🏆 Top Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productos.map((prod, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400 w-6">#{i + 1}</span>
                <div>
                  <p className="font-medium">{prod.nombre}</p>
                  <p className="text-xs text-gray-500">{prod.cantidad} vendidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(prod.total)}</p>
                <p className={cn("text-xs", prod.tendencia >= 0 ? "text-green-600" : "text-red-600")}>
                  {prod.tendencia >= 0 ? "↑" : "↓"} {Math.abs(prod.tendencia)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// PÁGINA BI / DASHBOARD ANALÍTICO
// ============================================

export function DashboardBI() {
  const [periodo, setPeriodo] = useState("hoy");

  // Mock data
  const ventasSemana = [850000, 920000, 780000, 1100000, 1250000, 1800000, 1500000];
  const pedidosPorHora = [
    { label: "12-14h", value: 45, color: "bg-yellow-400" },
    { label: "14-16h", value: 20, color: "bg-yellow-300" },
    { label: "18-20h", value: 65, color: "bg-red-400" },
    { label: "20-22h", value: 80, color: "bg-red-600" },
    { label: "22-00h", value: 30, color: "bg-red-300" },
  ];
  const ventasPorSector = [
    { label: "Salón", value: 1200000, color: "bg-blue-500" },
    { label: "Terraza", value: 800000, color: "bg-green-500" },
    { label: "Delivery", value: 600000, color: "bg-purple-500" },
    { label: "Barra", value: 400000, color: "bg-yellow-500" },
  ];
  const topProductos: ProductoTop[] = [
    { nombre: "Pizza Muzzarella", cantidad: 156, total: 780000, tendencia: 12 },
    { nombre: "Fugazzeta Rellena", cantidad: 98, total: 637000, tendencia: 8 },
    { nombre: "Empanadas x12", cantidad: 85, total: 510000, tendencia: -3 },
    { nombre: "Ñoquis Caseros", cantidad: 72, total: 432000, tendencia: 15 },
    { nombre: "Helado Artesanal", cantidad: 64, total: 256000, tendencia: 22 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analítico</h1>
          <p className="text-gray-500">KPIs, reportes y métricas en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={(v) => { if (v) setPeriodo(v) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="ayer">Ayer</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">📥 Exportar PDF</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard titulo="Ventas Hoy" valor="$1.250.000" cambio={12} icono="💰" color="text-green-600" />
        <KPICard titulo="Pedidos" valor={89} cambio={8} icono="📋" color="text-blue-600" />
        <KPICard titulo="Ticket Promedio" valor="$14.045" cambio={-2} icono="🧾" color="text-purple-600" />
        <KPICard titulo="Clientes Hoy" valor={67} cambio={15} icono="👥" color="text-orange-600" />
        <KPICard titulo="Mesas Activas" valor="12/18" icono="🪑" color="text-cyan-600" />
        <KPICard titulo="Stock Crítico" valor={3} icono="⚠️" color="text-red-600" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GraficoLineaSimple data={ventasSemana} titulo="📈 Ventas de la Semana" />
        <GraficoBarras data={pedidosPorHora} titulo="🕐 Pedidos por Horario" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GraficoBarras data={ventasPorSector} titulo="🏢 Ventas por Sector" />
        <TopProductos productos={topProductos} />
      </div>

      {/* Reportes rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Reportes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { titulo: "Ventas por día", icono: "📅" },
              { titulo: "Productos más vendidos", icono: "🏆" },
              { titulo: "Rentabilidad por plato", icono: "💵" },
              { titulo: "Horas pico", icono: "⏰" },
              { titulo: "Clientes frecuentes", icono: "🔄" },
              { titulo: "Stock y compras", icono: "📦" },
              { titulo: "Performance empleados", icono: "👨‍🍳" },
              { titulo: "Comparativa períodos", icono: "📊" },
            ].map((reporte) => (
              <Button key={reporte.titulo} variant="outline" className="justify-start h-auto p-3">
                <span className="text-xl mr-2">{reporte.icono}</span>
                <span className="text-sm">{reporte.titulo}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
