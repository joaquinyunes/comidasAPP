"use client";

import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import Bloque from "@/components/panel/ui/Bloque";
import Cifra from "@/components/panel/ui/Cifra";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";

interface ComparacionSucursal {
  sucursalId: string;
  nombre: string;
  pedidos: number;
  facturado: number;
}

interface ReportesResumen {
  totalPedidos: number;
  totalFacturado: number;
  comparacion: ComparacionSucursal[];
}

// Ventas de los últimos 30 días, total y por sucursal.
export default function PanelReportes() {
  const { datos, cargando, error, recargar } = useDatos<ReportesResumen>("/api/reportes/resumen", 0);

  if (cargando && !datos) return <p className="text-sm text-pn-suave">Armando el reporte…</p>;
  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (!datos) return null;

  const ticket = datos.totalPedidos > 0 ? datos.totalFacturado / datos.totalPedidos : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Cifra etiqueta="Pedidos (30 días)" valor={String(datos.totalPedidos)} />
        <Cifra etiqueta="Facturado (30 días)" valor={formatCurrency(datos.totalFacturado)} />
        <Cifra etiqueta="Ticket promedio" valor={formatCurrency(ticket)} />
      </div>

      <Bloque titulo="Por sucursal" sinPadding>
        {datos.comparacion.length === 0 ? (
          <div className="p-4">
            <EstadoVacio titulo="Sin ventas en el período" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pn-linea text-left text-xs text-pn-suave">
                <th className="px-4 py-2 font-medium">Sucursal</th>
                <th className="px-2 py-2 text-right font-medium">Pedidos</th>
                <th className="px-4 py-2 text-right font-medium">Facturado</th>
              </tr>
            </thead>
            <tbody className="pn-num">
              {datos.comparacion.map((c) => (
                <tr key={c.sucursalId} className="border-b border-pn-linea last:border-b-0">
                  <td className="px-4 py-2.5 font-medium">{c.nombre}</td>
                  <td className="px-2 py-2.5 text-right">{c.pedidos}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(c.facturado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Bloque>
    </div>
  );
}
