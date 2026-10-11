"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import Interruptor from "../ui/Interruptor";
import Etiqueta from "../ui/Etiqueta";
import EditorPrecio from "./EditorPrecio";
import { cambiarProducto } from "./acciones-carta";

export interface ProductoCarta {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
  destacado: boolean;
  estacion: string | null;
  categoria: string;
}

interface Props {
  producto: ProductoCarta;
  puedeEditarPrecio: boolean;
  onCambio: () => void;
}

export default function FilaProductoCarta({ producto, puedeEditarPrecio, onCambio }: Props) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alternarDisponible(disponible: boolean) {
    setOcupado(true);
    setError(null);
    const r = await cambiarProducto(producto.id, { disponible });
    setOcupado(false);
    if (r.ok) onCambio();
    else setError(r.mensaje ?? "No se pudo cambiar.");
  }

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1 basis-44">
          <p className={cn("font-medium", !producto.disponible && "text-pn-suave line-through")}>
            {producto.nombre}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-pn-suave">
            {!producto.disponible && <Etiqueta tono="peligro">Agotado</Etiqueta>}
            {producto.destacado && <Etiqueta tono="info">Destacado</Etiqueta>}
            {producto.estacion && <span>{producto.estacion}</span>}
          </p>
        </div>

        {puedeEditarPrecio ? (
          <EditorPrecio productoId={producto.id} precio={producto.precio} onGuardado={onCambio} />
        ) : (
          <p className="pn-num w-28 text-right font-semibold">{formatCurrency(producto.precio)}</p>
        )}

        <div className="flex w-32 items-center justify-end gap-2">
          <span className="text-xs text-pn-suave">{producto.disponible ? "Disponible" : "Agotado"}</span>
          <Interruptor
            activo={producto.disponible}
            onCambio={alternarDisponible}
            etiqueta={`${producto.nombre} disponible`}
            disabled={ocupado}
          />
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-pn-peligro">{error}</p>}
    </li>
  );
}
