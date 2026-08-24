"use client";

import { formatCurrency } from "@/lib/utils";
import type { ItemMenu } from "./useCarrito";
import CuponInput from "./CuponInput";

interface CategoriaMenu {
  categoria: string;
  items: ItemMenu[];
}

interface Props {
  mesaId: string;
  categorias: CategoriaMenu[];
  cantidades: Record<string, number>;
  onCambiar: (productoId: string, delta: number) => void;
  totalItems: number;
  totalMonto: number;
  cupon: { codigo: string; descuento: number } | null;
  onAplicarCupon: (codigo: string, descuento: number) => void;
  onQuitarCupon: () => void;
  enviando: boolean;
  error: string | null;
  onEnviar: () => void;
}

export default function MenuMesa({
  mesaId,
  categorias,
  cantidades,
  onCambiar,
  totalItems,
  totalMonto,
  cupon,
  onAplicarCupon,
  onQuitarCupon,
  enviando,
  error,
  onEnviar,
}: Props) {
  const totalFinal = Math.max(0, totalMonto - (cupon?.descuento ?? 0));
  return (
    <div className="mx-auto max-w-2xl p-6 pb-28">
      <h1 className="text-2xl font-bold mb-1">Menú de la mesa</h1>
      <p className="text-sm text-zinc-500 mb-4">Elegí y pedí cuando quieras.</p>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {categorias.map((c) => (
        <section key={c.categoria} className="mb-6">
          <h2 className="mb-2 font-semibold text-zinc-800">{c.categoria}</h2>
          <ul className="space-y-2">
            {c.items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {it.nombre}{" "}
                    {it.nivelPicante > 0 && "🌶️".repeat(Math.min(it.nivelPicante, 3))}
                  </div>
                  {it.descripcion && (
                    <div className="text-xs text-zinc-500">{it.descripcion}</div>
                  )}
                  {it.alergenos.length > 0 && (
                    <div className="text-xs text-amber-600">
                      Alérgenos: {it.alergenos.join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm tabular-nums">{formatCurrency(it.precio)}</span>
                  <button
                    onClick={() => onCambiar(it.id, -1)}
                    className="h-8 w-8 rounded-lg bg-zinc-100 text-lg leading-none disabled:opacity-40"
                    disabled={!cantidades[it.id]}
                    aria-label={`Quitar ${it.nombre}`}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm tabular-nums">
                    {cantidades[it.id] ?? 0}
                  </span>
                  <button
                    onClick={() => onCambiar(it.id, 1)}
                    className="h-8 w-8 rounded-lg bg-zinc-900 text-lg leading-none text-white"
                    aria-label={`Agregar ${it.nombre}`}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {totalItems > 0 && (
        <div className="my-4">
          <CuponInput
            mesaId={mesaId}
            subtotal={totalMonto}
            aplicado={cupon}
            onAplicar={onAplicarCupon}
            onQuitar={onQuitarCupon}
          />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white p-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="text-sm">
            <div className="font-semibold">
              {formatCurrency(totalFinal)}
              {cupon && (
                <span className="ml-1 text-xs font-normal text-zinc-400 line-through">
                  {formatCurrency(totalMonto)}
                </span>
              )}
            </div>
            <div className="text-zinc-500">{totalItems} ítem(s)</div>
          </div>
          <button
            onClick={onEnviar}
            disabled={totalItems === 0 || enviando}
            className="ml-auto rounded-xl bg-green-600 px-6 py-3 font-semibold text-white disabled:opacity-40"
          >
            {enviando ? "Enviando…" : "Enviar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
