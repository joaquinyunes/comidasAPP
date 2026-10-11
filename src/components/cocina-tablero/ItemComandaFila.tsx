"use client";

import { useState } from "react";
import { Flame, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import Boton from "@/components/panel/ui/Boton";
import { cambiarEstadoItem, etiquetaAccion, siguienteEstado } from "./cambiarItem";
import { alternarPausa, alternarUrgente } from "./accionesCocina";
import type { ItemComanda } from "./tipos";

interface Props {
  pedidoId: string;
  item: ItemComanda;
  conMesa: boolean;
  onCambio: () => void;
}

// Un plato de la comanda: qué es, cómo está y el único botón que sigue.
export default function ItemComandaFila({ pedidoId, item, conMesa, onCambio }: Props) {
  const [ocupado, setOcupado] = useState(false);

  // Con mesa, lo listo lo lleva el mozo desde el salón: cocina no lo entrega.
  const esperaMozo = item.estado === "listo" && conMesa;
  const accion = esperaMozo ? "" : etiquetaAccion(item.estado);
  const pausado = item.estado === "en_pausa";

  async function correr(fn: () => Promise<{ ok: boolean }>) {
    setOcupado(true);
    const r = await fn();
    setOcupado(false);
    if (r.ok) onCambio();
  }

  const avanzar = () => {
    const proximo = siguienteEstado(item.estado);
    if (proximo) void correr(() => cambiarEstadoItem(pedidoId, item.id, proximo));
  };

  return (
    <li
      className={cn(
        "flex items-start gap-2 px-3 py-2.5",
        item.estado === "listo" && "bg-pn-ok-fondo",
        pausado && "bg-pn-aviso-fondo"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug">
          <span className="pn-num font-semibold">{item.cantidad}×</span> {item.nombre}
        </p>
        {item.notas && (
          <p className="mt-0.5 rounded bg-pn-marca-fondo px-1.5 py-0.5 text-sm font-medium text-pn-tinta">
            {item.notas}
          </p>
        )}
        <p className="mt-0.5 text-xs text-pn-suave">
          {item.estado === "recibido" && "Sin empezar"}
          {item.estado === "en_preparacion" && "En preparación"}
          {pausado && "En pausa"}
          {item.estado === "listo" && (esperaMozo ? "Listo · lo lleva el mozo" : "Listo")}
          {item.estacion ? ` · ${item.estacion}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {item.estado !== "listo" && (
          <>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => correr(() => alternarUrgente(item.id))}
              aria-pressed={item.urgente}
              aria-label={item.urgente ? "Quitar urgente" : "Marcar como urgente"}
              className={cn(
                "grid size-11 place-items-center rounded-md border",
                item.urgente
                  ? "border-pn-peligro bg-pn-peligro-fondo text-pn-peligro"
                  : "border-pn-linea-fuerte bg-pn-papel text-pn-suave hover:bg-pn-hundido"
              )}
            >
              <Flame className="size-5" aria-hidden />
            </button>
            {item.estado === "en_preparacion" && (
              <button
                type="button"
                disabled={ocupado}
                onClick={() => correr(() => alternarPausa(item.id))}
                aria-label="Pausar"
                className="grid size-11 place-items-center rounded-md border border-pn-linea-fuerte bg-pn-papel text-pn-suave hover:bg-pn-hundido"
              >
                <Pause className="size-5" aria-hidden />
              </button>
            )}
          </>
        )}
        {accion && (
          <Boton variante="primario" tamano="grande" disabled={ocupado} onClick={avanzar}>
            {ocupado ? "…" : accion}
          </Boton>
        )}
      </div>
    </li>
  );
}
