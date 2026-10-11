"use client";

import { useDatos } from "@/hooks/use-datos";
import Bloque from "@/components/panel/ui/Bloque";
import Cifra from "@/components/panel/ui/Cifra";
import AvisoError from "@/components/panel/ui/AvisoError";
import RendimientoMozos from "@/components/panel/inicio/RendimientoMozos";
import type { ControlApi } from "@/components/panel/inicio/tipos";
import { MIN_CRITICA } from "@/lib/cocina/demora";

// Control operativo de los últimos 30 días: dónde se pierde plata y tiempo.
export default function PanelControlDueno() {
  const { datos: d, cargando, error, recargar } = useDatos<ControlApi>("/api/dueno/control-operativo", 0);

  if (cargando && !d) return <p className="text-sm text-pn-suave">Calculando…</p>;
  if (error && !d) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (!d) return null;

  const motivos = Object.entries(d.porMotivo).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cifra
          etiqueta="Platos anulados"
          valor={String(d.platosDevueltos)}
          detalle="En 30 días"
          tono={d.platosDevueltos > 0 ? "aviso" : "neutro"}
        />
        <Cifra
          etiqueta="Tiempo por plato"
          valor={`${d.tiempoPromedioServicioMin} min`}
          detalle="De cocina, en promedio"
          tono={d.tiempoPromedioServicioMin > MIN_CRITICA ? "aviso" : "neutro"}
        />
        <Cifra
          etiqueta="Faltantes de stock"
          valor={String(d.mermas)}
          detalle="Ingredientes en mínimo"
          tono={d.mermas > 0 ? "peligro" : "neutro"}
        />
        <Cifra
          etiqueta="Mesas sin atender"
          valor={String(d.mesasDesatendidas.length)}
          detalle={d.mesasDesatendidas.length ? d.mesasDesatendidas.map((m) => `Mesa ${m}`).join(", ") : "Ninguna ahora"}
          tono={d.mesasDesatendidas.length > 0 ? "peligro" : "neutro"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Por qué se anulan platos" nota="Motivos más frecuentes">
          {motivos.length === 0 ? (
            <p className="text-sm text-pn-suave">No hubo anulaciones.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {motivos.map(([motivo, n]) => (
                <li key={motivo} className="flex justify-between gap-3">
                  <span>{motivo}</span>
                  <span className="pn-num font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloque>
        <RendimientoMozos filas={d.rendimiento} />
      </div>
    </div>
  );
}
