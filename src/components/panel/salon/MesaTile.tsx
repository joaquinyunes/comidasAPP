import { Clock } from "lucide-react";
import { duracionCorta } from "@/lib/panel/duracion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { visualMesa } from "../estados-visuales";
import { CLASE_BORDE_TONO, type Tono } from "../tonos";
import { pideCuenta } from "@/lib/salon/resumir-salon";
import Etiqueta from "../ui/Etiqueta";
import type { MesaSalon } from "./tipos";

// El borde solo se "enciende" cuando la mesa espera algo del mozo.
function tonoBorde(m: MesaSalon): Tono {
  if (pideCuenta(m.estado)) return "peligro";
  if (m.platosListos > 0) return "info";
  if (m.estado === "limpieza") return "aviso";
  return "neutro";
}

interface Props {
  mesa: MesaSalon;
  seleccionada: boolean;
  onElegir: () => void;
}

export default function MesaTile({ mesa, seleccionada, onElegir }: Props) {
  const visual = visualMesa(mesa.estado);
  const minutos = Math.floor(mesa.segundosDesdeCambio / 60);
  const libre = mesa.estado === "libre";

  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={seleccionada}
      aria-label={`Mesa ${mesa.numero}, ${visual.etiqueta}${mesa.platosListos ? `, ${mesa.platosListos} platos para llevar` : ""}`}
      className={cn(
        "flex min-h-32 flex-col justify-between rounded-lg border-2 p-3 text-left transition-colors",
        libre ? "bg-pn-fondo" : "bg-pn-papel",
        CLASE_BORDE_TONO[tonoBorde(mesa)],
        seleccionada && "outline outline-2 outline-offset-2 outline-pn-tinta",
        "hover:bg-pn-hundido"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="pn-num text-3xl font-semibold leading-none">{mesa.numero}</span>
        <span className="text-xs text-pn-suave">{mesa.capacidad} lugares</span>
      </div>

      <div className="mt-3 space-y-1.5">
        <Etiqueta tono={visual.tono}>{visual.etiqueta}</Etiqueta>

        {mesa.platosListos > 0 && (
          <p className="pn-latido text-sm font-semibold text-pn-info">
            {mesa.platosListos} {mesa.platosListos === 1 ? "plato listo" : "platos listos"}
          </p>
        )}

        {!libre && (
          <p className="pn-num flex items-center justify-between text-xs text-pn-suave">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {duracionCorta(minutos)}
            </span>
            {mesa.totalAbierto > 0 && (
              <span className="font-medium text-pn-tinta">{formatCurrency(mesa.totalAbierto)}</span>
            )}
          </p>
        )}
      </div>
    </button>
  );
}
