"use client";

import { useDatos } from "@/hooks/use-datos";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import AvisoError from "../ui/AvisoError";
import VentasPorDia from "./VentasPorDia";
import MasVendidos from "./MasVendidos";
import HorasPico from "./HorasPico";
import type { Tendencias } from "./tipos";

// Cómo se mueve el negocio: días, productos y horarios.
export default function PanelTendencias() {
  const { datos, cargando, error, recargar } = useDatos<Tendencias>("/api/reportes/tendencias", 0);

  return (
    <div className="mx-auto max-w-5xl">
      <EncabezadoPagina
        titulo="Tendencias"
        descripcion="Qué días y a qué hora se vende, y qué platos sostienen el negocio."
      />

      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && !datos && <p className="text-sm text-pn-suave">Armando los gráficos…</p>}

      {datos && (
        <div className="space-y-4">
          <VentasPorDia dias={datos.ventasPorDia} />
          <div className="grid gap-4 lg:grid-cols-2">
            <MasVendidos items={datos.masVendidos} />
            <HorasPico pedidosPorHora={datos.pedidosPorHora} />
          </div>
        </div>
      )}
    </div>
  );
}
