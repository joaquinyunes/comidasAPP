"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { esCancelable, esCobrable } from "@/lib/pedidos/grupos-lista";
import { visualPedido } from "@/components/panel/estados-visuales";
import Boton from "@/components/panel/ui/Boton";
import Etiqueta from "@/components/panel/ui/Etiqueta";
import { cancelarPedido } from "./accionesPedido";
import CobroInline from "./CobroInline";
import type { PedidoLista } from "./tipos";

interface Props {
  pedido: PedidoLista;
  onCambio: () => void;
}

function titulo(p: PedidoLista): string {
  if (p.mesaNumero) return `Mesa ${p.mesaNumero}`;
  if (p.tipo === "delivery") return "Delivery";
  if (p.tipo === "local") return "En el local";
  return "Para llevar";
}

export default function PedidoFila({ pedido, onCambio }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visual = visualPedido(pedido.estado);
  const vivos = pedido.items.filter((i) => !i.anulado);

  async function cancelar() {
    if (!confirm("¿Cancelar este pedido? Esto no se puede deshacer.")) return;
    const r = await cancelarPedido(pedido.id);
    if (r.ok) onCambio();
    else setError(r.mensaje ?? "No se pudo cancelar.");
  }

  return (
    <li className="rounded-lg border border-pn-linea bg-pn-papel">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex min-h-16 w-full items-center gap-3 px-3 py-2 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{titulo(pedido)}</span>
          <span className="block truncate text-sm text-pn-suave">
            <span className="pn-num">{formatTime(pedido.createdAt)}</span> · {vivos.length}{" "}
            {vivos.length === 1 ? "plato" : "platos"}
            {pedido.clienteNombre ? ` · ${pedido.clienteNombre}` : ""}
          </span>
        </span>
        <Etiqueta tono={visual.tono}>{visual.etiqueta}</Etiqueta>
        <span className="pn-num w-24 text-right font-semibold">{formatCurrency(pedido.total)}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-pn-suave transition-transform", abierto && "rotate-180")} aria-hidden />
      </button>

      {abierto && (
        <div className="border-t border-pn-linea px-3 py-3">
          <ul className="mb-3 space-y-1 text-sm">
            {pedido.items.map((it) => (
              <li key={it.id} className={cn("flex justify-between gap-3", it.anulado && "text-pn-suave line-through")}>
                <span>
                  <span className="pn-num">{it.cantidad}×</span> {it.productoNombre}
                </span>
                <span className="pn-num">{formatCurrency(it.subtotal)}</span>
              </li>
            ))}
          </ul>
          {pedido.notas && <p className="mb-3 text-sm italic text-pn-suave">{pedido.notas}</p>}
          {error && <p className="mb-2 text-sm text-pn-peligro">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {esCobrable(pedido.estado) && (
              <Boton variante="primario" onClick={() => setCobrando((v) => !v)}>
                {cobrando ? "Cerrar cobro" : "Cobrar"}
              </Boton>
            )}
            {esCancelable(pedido.estado) && (
              <Boton variante="peligro" onClick={cancelar}>
                Cancelar pedido
              </Boton>
            )}
          </div>

          {cobrando && esCobrable(pedido.estado) && (
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
    </li>
  );
}
