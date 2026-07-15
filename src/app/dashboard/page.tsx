"use client";

import { GemeloDigital, MesaDetalle } from "@/components/gemelo-digital";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMesaStore, useDashboardStore } from "@/lib/store";
import { useState, useEffect } from "react";
import type { Mesa } from "@/types";

export default function DashboardPage() {
  const { mesas, mesaSeleccionada, seleccionarMesa, getMesaById } = useMesaStore();
  const { kpis, setKPIs } = useDashboardStore();
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/resumen")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setKPIs(data);
      })
      .catch(() => {});
  }, [setKPIs]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Operativo
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover-lift animate-fadeInUp group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
          {icono}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {tendencia && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            tendencia === "up"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}>
            {tendencia === "up" ? "↑" : "↓"} vs ayer
          </span>
        )}
      </div>
      {porcentaje !== undefined && (
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
