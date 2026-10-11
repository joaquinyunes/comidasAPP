import { cn } from "@/lib/utils";

interface Props {
  leyenda: string;
  opciones: readonly { valor: string; etiqueta: string }[];
  valor: string;
  onCambio: (valor: string) => void;
  columnas?: 2 | 3;
}

// Una opción entre pocas, con botones grandes (se tocan rápido en caja).
export default function GrupoOpciones({ leyenda, opciones, valor, onCambio, columnas = 2 }: Props) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium text-pn-suave">{leyenda}</legend>
      <div className={cn("grid gap-2", columnas === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={valor === o.valor}
            onClick={() => onCambio(o.valor)}
            className={cn(
              "min-h-12 rounded-md border text-sm font-medium",
              valor === o.valor
                ? "border-pn-tinta bg-pn-tinta text-white"
                : "border-pn-linea-fuerte bg-pn-papel hover:bg-pn-hundido"
            )}
          >
            {o.etiqueta}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
