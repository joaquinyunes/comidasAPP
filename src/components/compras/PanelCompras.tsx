"use client";

import { useDatos } from "@/hooks/use-datos";
import Bloque from "@/components/panel/ui/Bloque";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";

interface SugerenciaCompra {
  ingredienteId: string;
  nombre: string;
  unidad: string;
  cantidadActual: number;
  stockMinimo: number;
  sugeridoComprar: number;
}

interface Respuesta {
  sugerencias: SugerenciaCompra[];
}

// Qué conviene comprar hoy: lo que está por debajo del mínimo.
export default function PanelCompras() {
  const { datos, cargando, error, recargar } = useDatos<Respuesta>("/api/compras/sugerencia-automatica", 0);
  const sugerencias = datos?.sugerencias ?? [];

  if (cargando && !datos) return <p className="text-sm text-pn-suave">Calculando qué falta…</p>;
  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (sugerencias.length === 0) {
    return <EstadoVacio titulo="Todo abastecido" detalle="Ningún ingrediente está por debajo de su mínimo." />;
  }

  return (
    <Bloque
      titulo="Para comprar"
      nota={`${sugerencias.length} ${sugerencias.length === 1 ? "ingrediente" : "ingredientes"} por debajo del mínimo`}
      sinPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pn-linea text-left text-xs text-pn-suave">
              <th className="px-4 py-2 font-medium">Ingrediente</th>
              <th className="px-2 py-2 text-right font-medium">Hay</th>
              <th className="px-2 py-2 text-right font-medium">Mínimo</th>
              <th className="px-4 py-2 text-right font-medium">Comprar</th>
            </tr>
          </thead>
          <tbody className="pn-num">
            {sugerencias.map((s) => (
              <tr key={s.ingredienteId} className="border-b border-pn-linea last:border-b-0">
                <td className="px-4 py-2.5 font-medium">{s.nombre}</td>
                <td className="px-2 py-2.5 text-right font-medium text-pn-peligro">
                  {s.cantidadActual} {s.unidad}
                </td>
                <td className="px-2 py-2.5 text-right text-pn-suave">
                  {s.stockMinimo} {s.unidad}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {s.sugeridoComprar} {s.unidad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Bloque>
  );
}
