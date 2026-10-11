import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ItemCarta } from "./tipos";

interface Props {
  item: ItemCarta;
  cantidad: number;
  onSumar: () => void;
  onRestar: () => void;
}

// Un plato de la carta con su contador. Lo no disponible se ve, pero no se puede pedir.
export default function FilaProducto({ item, cantidad, onSumar, onRestar }: Props) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 border-b border-pn-linea px-3 py-2.5 last:border-b-0",
        cantidad > 0 && "bg-pn-marca-fondo"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", !item.disponible && "text-pn-suave line-through")}>
          {item.nombre}
        </p>
        <p className="pn-num text-xs text-pn-suave">
          {item.disponible ? formatCurrency(item.precio) : "No disponible"}
          {item.alergenos.length > 0 && ` · ${item.alergenos.join(", ")}`}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {cantidad > 0 && (
          <>
            <button
              type="button"
              onClick={onRestar}
              aria-label={`Quitar uno de ${item.nombre}`}
              className="grid size-11 place-items-center rounded-md border border-pn-linea-fuerte bg-pn-papel hover:bg-pn-hundido"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="pn-num w-7 text-center text-base font-semibold">{cantidad}</span>
          </>
        )}
        <button
          type="button"
          onClick={onSumar}
          disabled={!item.disponible}
          aria-label={`Agregar ${item.nombre}`}
          className="grid size-11 place-items-center rounded-md border border-pn-tinta bg-pn-tinta text-white hover:bg-black disabled:cursor-not-allowed disabled:border-pn-linea disabled:bg-pn-hundido disabled:text-pn-suave"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
