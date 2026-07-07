"use client";

import { GemeloDigital, MesaDetalle } from "@/components/gemelo-digital";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMesaStore, useDashboardStore } from "@/lib/store";
import { useState } from "react";
import type { Mesa } from "@/types";

export default function DashboardPage() {
  const { mesas, mesaSeleccionada, seleccionarMesa, getMesaById } = useMesaStore();
  const { kpis } = useDashboardStore();
  const [showDetalle, setShowDetalle] = useState(false);

  const mesaSeleccionadaData = mesaSeleccionada ? getMesaById(mesaSeleccionada) : null;

  const handleMesaClick = (mesa: Mesa) => {
    setShowDetalle(true);
  };

  const handleCobrar = (mesaId: string) => {
    // TODO: Implementar flujo de cobro
    console.log("Cobrar mesa:", mesaId);
    setShowDetalle(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Vista general del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            🟢 Sistema operativo
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          titulo="Ventas hoy"
          valor={`$${kpis.ventasHoy.toLocaleString()}`}
          icono="💰"
          tendencia={kpis.ventasHoy > kpis.ventasAyer ? "up" : "down"}
        />
        <KPICard
          titulo="Ticket promedio"
          valor={`$${kpis.ticketPromedio.toLocaleString()}`}
          icono="🧾"
        />
        <KPICard
          titulo="Mesas ocupadas"
          valor={`${kpis.mesasOcupadas}/${kpis.mesasTotales}`}
          icono="🪑"
          porcentaje={kpis.mesasTotales > 0 ? (kpis.mesasOcupadas / kpis.mesasTotales) * 100 : 0}
        />
        <KPICard
          titulo="Pedidos activos"
          valor={kpis.pedidosActivos.toString()}
          icono="📋"
        />
      </div>

      {/* Gemelo Digital */}
      <GemeloDigital onMesaClick={handleMesaClick} />

      {/* Modal de detalle */}
      {showDetalle && (
        <MesaDetalle
          mesa={mesaSeleccionadaData || null}
          onCerrar={() => {
            setShowDetalle(false);
            seleccionarMesa(null);
          }}
          onCobrar={handleCobrar}
        />
      )}
    </div>
  );
}

function KPICard({
  titulo,
  valor,
  icono,
  tendencia,
  porcentaje,
}: {
  titulo: string;
  valor: string;
  icono: string;
  tendencia?: "up" | "down";
  porcentaje?: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">
            {titulo}
          </CardTitle>
          <span className="text-2xl">{icono}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        {tendencia && (
          <p className={`text-xs mt-1 ${tendencia === "up" ? "text-green-600" : "text-red-600"}`}>
            {tendencia === "up" ? "↑" : "↓"} vs ayer
          </p>
        )}
        {porcentaje !== undefined && (
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
