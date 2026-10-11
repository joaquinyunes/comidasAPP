import { cn } from "@/lib/utils";

export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
  cantidad?: number;
}

interface Props {
  opciones: OpcionFiltro[];
  valor: string;
  onCambio: (valor: string) => void;
  "aria-label": string;
}

// Selector de una opción entre pocas, siempre visible (no desplegable).
export default function Filtros({ opciones, valor, onCambio, ...resto }: Props) {
  return (
    <div role="group" aria-label={resto["aria-label"]} className="flex flex-wrap gap-1.5">
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambio(o.valor)}
            className={cn(
              "min-h-9 rounded-md border px-3 text-sm font-medium transition-colors",
              activo
                ? "border-pn-tinta bg-pn-tinta text-white"
                : "border-pn-linea-fuerte bg-pn-papel text-pn-tinta hover:bg-pn-hundido"
            )}
          >
            {o.etiqueta}
            {o.cantidad !== undefined && (
              <span className={cn("pn-num ml-1.5", activo ? "text-white/70" : "text-pn-suave")}>{o.cantidad}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
