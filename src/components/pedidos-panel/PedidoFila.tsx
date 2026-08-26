"use client";

import { useState } from "react";
import { formatCurrency, formatTime } from "@/lib/utils";
import { cancelarPedido } from "./accionesPedido";
import CobroInline from "./CobroInline";
import type { PedidoLista } from "./tipos";

const ESTADO_COLOR: Record<string, string> = {
  recibido: "bg-zinc-100 text-zinc-700",
  en_preparacion: "bg-amber-100 text-amber-800",
  listo: "bg-blue-100 text-blue-800",
  entregado: "bg-indigo-100 text-indigo-800",
  pagado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-700",
};

const ESTADO_LABEL: Record<string, string> = {
  recibido: "Recibido",
  en_preparacion: "En cocina",
  listo: "Listo",
  entregado: "Entregado",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

interface Props {
  pedido: PedidoLista;
  onCambio: () => void;
}

export default function PedidoFila({ pedido, onCambio }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const cobrable = !["pagado", "cancelado"].includes(pedido.estado);
  const cancelable = ["recibido", "en_preparacion"].includes(pedido.estado);
  const itemsVivos = pedido.items.filter((i) => !i.anulado);

  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="w-14 shrink-0 text-center">
          <span className="block font-semibold">
            {pedido.mesaNumero ? `M${pedido.mesaNumero}` : pedido.tipo}
          </span>
          <span className="block text-xs text-zinc-500">{formatTime(pedido.createdAt)}</span>
        </span>
        <span className="flex-1 text-sm text-zinc-600">
          {itemsVivos.length} ítem(s)
          {pedido.clienteNombre ? ` · ${pedido.clienteNombre}` : ""}
        </span>
        <span className="font-semibold tabular-nums">{formatCurrency(pedido.total)}</span>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[pedido.estado] ?? "bg-zinc-100"}`}>
          {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
        </span>
      </button>

      {abierto && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <ul className="mb-2 space-y-1 text-sm">
            {pedido.items.map((it) => (
              <li key={it.id} className={`flex justify-between ${it.anulado ? "text-zinc-400 line-through" : ""}`}>
                <span>{it.cantidad}× {it.productoNombre}</span>
                <span className="tabular-nums">{formatCurrency(it.subtotal)}</span>
              </li>
            ))}
          </ul>
          {pedido.notas && <p className="mb-2 text-xs italic text-zinc-500">{pedido.notas}</p>}

          <div className="flex gap-2">
            {cobrable && (
              <button
                onClick={() => setCobrando((v) => !v)}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white"
              >
                {cobrando ? "Cerrar cobro" : "Cobrar"}
              </button>
            )}
            {cancelable && (
              <button
                onClick={async () => {
                  if (confirm("¿Cancelar este pedido?")) {
                    const r = await cancelarPedido(pedido.id);
                    if (r.ok) onCambio();
                  }
                }}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Cancelar
              </button>
            )}
          </div>

          {cobrando && cobrable && (
            <CobroInline
              pedidoId={pedido.id}
              total={pedido.total}
              onCobrado={() => {
                setCobrando(false);
                onCambio();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
