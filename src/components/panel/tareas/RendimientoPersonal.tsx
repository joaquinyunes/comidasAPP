"use client";

import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import type { RendimientoFila } from "@/components/personal/tipos";
import Bloque from "../ui/Bloque";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";

// Qué hizo cada persona en los últimos 7 días.
export default function RendimientoPersonal() {
  const { datos, cargando, error, recargar } = useDatos<RendimientoFila[]>("/api/personal/rendimiento", 0);

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando && !datos) return <p className="text-sm text-pn-suave">Calculando…</p>;
  const filas = datos ?? [];
  if (filas.length === 0) {
    return <EstadoVacio titulo="Sin datos de la semana" detalle="Aparecen cuando hay turnos y pedidos cargados." />;
  }

  return (
    <Bloque titulo="Últimos 7 días" sinPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pn-linea text-left text-xs text-pn-suave">
              <th className="px-4 py-2 font-medium">Persona</th>
              <th className="px-2 py-2 text-right font-medium">Turnos</th>
              <th className="px-2 py-2 text-right font-medium">Horas</th>
              <th className="px-2 py-2 text-right font-medium">Pedidos</th>
              <th className="px-2 py-2 text-right font-medium">Ventas</th>
              <th className="px-4 py-2 text-right font-medium">Por hora</th>
            </tr>
          </thead>
          <tbody className="pn-num">
            {filas.map((f) => (
              <tr key={f.empleadoId} className="border-b border-pn-linea last:border-b-0">
                <td className="px-4 py-2.5 font-medium">{f.nombre}</td>
                <td className="px-2 py-2.5 text-right">{f.turnos}</td>
                <td className="px-2 py-2.5 text-right">{f.horasTrabajadas}</td>
                <td className="px-2 py-2.5 text-right">{f.pedidosAtendidos}</td>
                <td className="px-2 py-2.5 text-right">{formatCurrency(f.ventasTotales)}</td>
                <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(f.ventasPorHora)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Bloque>
  );
}
