"use client";

import { useMemo } from "react";
import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import AvisoError from "../ui/AvisoError";
import Bloque from "../ui/Bloque";
import CifrasTurno from "./CifrasTurno";
import ListaAlertas from "./ListaAlertas";
import RendimientoMozos from "./RendimientoMozos";
import { armarAlertas } from "./armar-alertas";
import type { ControlApi, ResumenApi } from "./tipos";

function fechaLarga(): string {
  return new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

// Pantalla del jefe: cómo viene el turno y qué requiere una decisión.
export default function ResumenTurno() {
  const resumen = useDatos<ResumenApi>("/api/dashboard/resumen", 30000);
  const control = useDatos<ControlApi>("/api/dueno/control-operativo", 60000);

  const alertas = useMemo(
    () => armarAlertas(resumen.datos, control.datos),
    [resumen.datos, control.datos]
  );

  return (
    <div className="mx-auto max-w-5xl">
      <EncabezadoPagina titulo="Resumen del turno" descripcion={fechaLarga()} />

      {resumen.error && !resumen.datos && (
        <div className="mb-4">
          <AvisoError onReintentar={resumen.recargar}>{resumen.error}</AvisoError>
        </div>
      )}

      {!resumen.datos && !resumen.error && <p className="text-sm text-pn-suave">Cargando el turno…</p>}

      {resumen.datos && (
        <div className="space-y-4">
          <CifrasTurno r={resumen.datos} />
          <ListaAlertas alertas={alertas} />

          <div className="grid gap-4 lg:grid-cols-2">
            {control.datos && <RendimientoMozos filas={control.datos.rendimiento} />}
            <Bloque titulo="El mes hasta hoy">
              <p className="pn-num text-3xl font-semibold">{formatCurrency(resumen.datos.ventasMes)}</p>
              <p className="mt-1 text-sm text-pn-suave">Cobrado desde el 1 del mes, propinas incluidas.</p>
            </Bloque>
          </div>
        </div>
      )}
    </div>
  );
}
