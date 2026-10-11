"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { minutosDesde, nivelDemora, type NivelDemora } from "@/lib/cocina/demora";
import { formatoDuracion } from "@/lib/panel/duracion";
import Boton from "@/components/panel/ui/Boton";
import ItemComandaFila from "./ItemComandaFila";
import { avanzarVarios } from "./accionesCocina";
import type { Comanda } from "./tipos";

const BORDE: Record<NivelDemora, string> = {
  normal: "border-pn-linea",
  atencion: "border-pn-aviso",
  critica: "border-pn-peligro",
};

const TIEMPO: Record<NivelDemora, string> = {
  normal: "text-pn-suave",
  atencion: "text-pn-aviso",
  critica: "text-pn-peligro",
};

interface Props {
  comanda: Comanda;
  ahora: number;
  onCambio: () => void;
}

export default function ComandaCard({ comanda, ahora, onCambio }: Props) {
  const [ocupado, setOcupado] = useState(false);
  const minutos = minutosDesde(comanda.desde, ahora);
  const nivel = nivelDemora(minutos);
  const conMesa = Boolean(comanda.mesa);

  const sinEmpezar = comanda.items.filter((i) => i.estado === "recibido");
  const enMarcha = comanda.items.filter((i) => i.estado === "en_preparacion");

  async function todo(items: Comanda["items"], hacia: string) {
    setOcupado(true);
    await avanzarVarios(comanda.pedidoId, items, hacia);
    setOcupado(false);
    onCambio();
  }

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-lg border-2 bg-pn-papel", BORDE[nivel])}>
      <header className="flex items-center justify-between border-b border-pn-linea px-3 py-2">
        <h3 className="text-lg font-semibold">
          {comanda.mesa ? `Mesa ${comanda.mesa}` : comanda.tipo === "delivery" ? "Delivery" : "Para llevar"}
        </h3>
        <p className={cn("pn-num text-base font-semibold", TIEMPO[nivel], nivel === "critica" && "pn-latido")}>
          {formatoDuracion(minutos)}
          {nivel !== "normal" && (
            <span className="ml-1.5 text-xs font-medium">{nivel === "critica" ? "demorada" : "atención"}</span>
          )}
        </p>
      </header>

      <ul className="divide-y divide-pn-linea">
        {comanda.items.map((it) => (
          <ItemComandaFila key={it.id} pedidoId={comanda.pedidoId} item={it} conMesa={conMesa} onCambio={onCambio} />
        ))}
      </ul>

      {(sinEmpezar.length > 1 || enMarcha.length > 1) && (
        <footer className="flex gap-2 border-t border-pn-linea bg-pn-fondo p-2">
          {sinEmpezar.length > 1 && (
            <Boton className="flex-1" disabled={ocupado} onClick={() => todo(sinEmpezar, "en_preparacion")}>
              Empezar todo
            </Boton>
          )}
          {enMarcha.length > 1 && (
            <Boton className="flex-1" disabled={ocupado} onClick={() => todo(enMarcha, "listo")}>
              Todo listo
            </Boton>
          )}
        </footer>
      )}
    </article>
  );
}
