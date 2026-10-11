"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/utils";
import { cambiarEstadoItem } from "@/components/cocina-tablero/cambiarItem";
import { visualPedido } from "../estados-visuales";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import type { PedidoSalon } from "./tipos";

interface Props {
  pedido: PedidoSalon;
  onCambio: () => void;
}

// Una comanda de la mesa con el estado real de cada plato.
// Lo que está listo se puede marcar como llevado a la mesa.
export default function ComandaDetalle({ pedido, onCambio }: Props) {
  const [ocupado, setOcupado] = useState<string | null>(null);

  async function llevado(itemId: string) {
    setOcupado(itemId);
    const r = await cambiarEstadoItem(pedido.id, itemId, "entregado");
    setOcupado(null);
    if (r.ok) onCambio();
  }

  return (
    <section className="rounded-lg border border-pn-linea bg-pn-papel">
      <header className="flex items-center justify-between border-b border-pn-linea px-3 py-2 text-sm">
        <span className="pn-num text-pn-suave">Comanda de las {formatTime(pedido.creadoEn)}</span>
        <span className="pn-num font-semibold">{formatCurrency(pedido.total)}</span>
      </header>

      <ul className="divide-y divide-pn-linea">
        {pedido.items.map((it) => {
          const v = visualPedido(it.estado);
          return (
            <li key={it.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  <span className="pn-num">{it.cantidad}×</span> {it.nombre}
                </p>
                {it.notas && <p className="text-xs italic text-pn-suave">{it.notas}</p>}
              </div>

              {it.estado === "listo" ? (
                <Boton
                  variante="primario"
                  disabled={ocupado === it.id}
                  onClick={() => llevado(it.id)}
                  aria-label={`Marcar ${it.nombre} como llevado`}
                >
                  <Check className="size-4" aria-hidden />
                  Llevado
                </Boton>
              ) : (
                <Etiqueta tono={v.tono}>{v.etiqueta}</Etiqueta>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
