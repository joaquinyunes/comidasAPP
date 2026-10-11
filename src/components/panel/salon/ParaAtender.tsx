import { cn } from "@/lib/utils";
import { formatoDuracion } from "@/lib/panel/duracion";
import type { Atencion } from "@/lib/salon/resumir-salon";
import type { MesaSalon } from "./tipos";

interface Props {
  atenciones: Atencion<MesaSalon>[];
  onElegir: (mesaId: string) => void;
}

// Lo primero que mira el mozo: a qué mesa tiene que ir ya.
export default function ParaAtender({ atenciones, onElegir }: Props) {
  if (atenciones.length === 0) return null;

  return (
    <section aria-label="Para atender ahora" className="mb-5">
      <h2 className="mb-2 text-sm font-semibold">Para atender ahora</h2>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {atenciones.map(({ mesa, motivo, minutos }) => (
          <li key={mesa.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onElegir(mesa.id)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-lg border-2 bg-pn-papel px-3 text-left hover:bg-pn-hundido",
                motivo === "cuenta" ? "border-pn-peligro" : "border-pn-info"
              )}
            >
              <span className="pn-num text-2xl font-semibold">{mesa.numero}</span>
              <span className="text-sm leading-tight">
                <span className="block font-medium">
                  {motivo === "cuenta"
                    ? "Pide la cuenta"
                    : `${mesa.platosListos} ${mesa.platosListos === 1 ? "plato" : "platos"} para llevar`}
                </span>
                <span className="pn-num block text-xs text-pn-suave">hace {formatoDuracion(minutos)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
