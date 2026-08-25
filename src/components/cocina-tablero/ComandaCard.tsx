"use client";

import { useState } from "react";
import { cambiarEstadoItem, siguienteEstado, etiquetaAccion } from "./cambiarItem";
import type { Comanda } from "./tipos";

const ESTADO_ITEM_COLOR: Record<string, string> = {
  recibido: "bg-zinc-100",
  en_preparacion: "bg-amber-100",
  en_pausa: "bg-orange-100",
  listo: "bg-green-100",
};

function minutosDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

interface Props {
  comanda: Comanda;
  onCambio: () => void;
}

export default function ComandaCard({ comanda, onCambio }: Props) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const mins = minutosDesde(comanda.desde);
  const demorada = mins >= 15;

  async function avanzar(itemId: string, actual: string) {
    const proximo = siguienteEstado(actual);
    if (!proximo) return;
    setOcupado(itemId);
    const r = await cambiarEstadoItem(comanda.pedidoId, itemId, proximo);
    setOcupado(null);
    if (r.ok) onCambio();
  }

  return (
    <article
      className={`flex flex-col rounded-2xl border-2 p-3 ${
        demorada ? "border-red-400" : "border-zinc-200"
      }`}
    >
      <header className="mb-2 flex items-center justify-between">
        <span className="font-bold">
          {comanda.mesa ? `Mesa ${comanda.mesa}` : comanda.tipo}
        </span>
        <span className={`text-xs ${demorada ? "font-semibold text-red-600" : "text-zinc-500"}`}>
          {mins} min
        </span>
      </header>

      <ul className="space-y-1.5">
        {comanda.items.map((it) => {
          const accion = etiquetaAccion(it.estado);
          return (
            <li
              key={it.id}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                ESTADO_ITEM_COLOR[it.estado] ?? "bg-zinc-100"
              }`}
            >
              <span className="flex-1 text-sm">
                {it.urgente && <span className="text-red-600">⚡ </span>}
                <strong>{it.cantidad}×</strong> {it.nombre}
                {it.notas && <em className="block text-xs text-zinc-600">{it.notas}</em>}
              </span>
              {accion && (
                <button
                  onClick={() => avanzar(it.id, it.estado)}
                  disabled={ocupado === it.id}
                  className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
                >
                  {ocupado === it.id ? "…" : accion}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
