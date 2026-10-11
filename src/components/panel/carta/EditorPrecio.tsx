"use client";

import { useId, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cambiarProducto } from "./acciones-carta";

interface Props {
  productoId: string;
  precio: number;
  onGuardado: () => void;
}

// Precio con edición en el lugar: tocás, escribís, confirmás.
export default function EditorPrecio({ productoId, precio, onGuardado }: Props) {
  const id = useId();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(String(precio));
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numero = Number(valor.replace(",", "."));
  const valido = Number.isFinite(numero) && numero > 0 && numero !== precio;

  async function guardar() {
    if (!valido) return;
    setOcupado(true);
    setError(null);
    const r = await cambiarProducto(productoId, { precio: numero });
    setOcupado(false);
    if (r.ok) {
      setEditando(false);
      onGuardado();
    } else setError(r.mensaje ?? "No se pudo guardar.");
  }

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => {
          setValor(String(precio));
          setEditando(true);
        }}
        aria-label={`Cambiar precio, hoy ${formatCurrency(precio)}`}
        className="pn-num inline-flex min-h-10 w-28 items-center justify-end gap-1.5 rounded-md px-2 text-right font-semibold hover:bg-pn-hundido"
      >
        {formatCurrency(precio)}
        <Pencil className="size-3.5 text-pn-suave" aria-hidden />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="sr-only">
          Nuevo precio
        </label>
        <input
          id={id}
          inputMode="decimal"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void guardar();
            if (e.key === "Escape") setEditando(false);
          }}
          className="pn-num min-h-10 w-24 rounded-md border border-pn-tinta bg-pn-papel px-2 text-right"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={!valido || ocupado}
          aria-label="Guardar precio"
          className="grid size-10 place-items-center rounded-md bg-pn-tinta text-white disabled:opacity-40"
        >
          <Check className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setEditando(false)}
          aria-label="Cancelar"
          className="grid size-10 place-items-center rounded-md border border-pn-linea-fuerte hover:bg-pn-hundido"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-pn-peligro">{error}</p>}
    </div>
  );
}
