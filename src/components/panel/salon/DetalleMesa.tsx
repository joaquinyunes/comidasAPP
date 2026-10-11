"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { visualMesa } from "../estados-visuales";
import Hoja from "../ui/Hoja";
import Etiqueta from "../ui/Etiqueta";
import AvisoError from "../ui/AvisoError";
import EstadoVacio from "../ui/EstadoVacio";
import AccionesMesa from "./AccionesMesa";
import ComandaDetalle from "./ComandaDetalle";
import CobroMesa from "./CobroMesa";
import { cambiarEstadoMesa } from "./acciones-salon";
import type { MesaSalon } from "./tipos";

interface Props {
  mesa: MesaSalon;
  onCerrar: () => void;
  onTomarPedido: () => void;
  onCambio: () => void;
}

// Todo lo de una mesa en una sola hoja: qué pidió, en qué está cada
// plato y qué puede hacer el mozo ahora.
export default function DetalleMesa({ mesa, onCerrar, onTomarPedido, onCambio }: Props) {
  const [cobrando, setCobrando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [falla, setFalla] = useState<string | null>(null);
  const visual = visualMesa(mesa.estado);

  async function cambiarEstado(estado: string) {
    setOcupado(true);
    setFalla(null);
    const r = await cambiarEstadoMesa(mesa.id, estado);
    setOcupado(false);
    if (r.ok) onCambio();
    else setFalla(r.mensaje ?? "No se pudo cambiar la mesa.");
  }

  return (
    <Hoja
      titulo={`Mesa ${mesa.numero}`}
      subtitulo={`${mesa.sector} · ${mesa.capacidad} lugares`}
      onCerrar={onCerrar}
      pie={
        <AccionesMesa
          mesa={mesa}
          cobrando={cobrando}
          ocupado={ocupado}
          onTomarPedido={onTomarPedido}
          onAlternarCobro={() => setCobrando((v) => !v)}
          onCambiarEstado={cambiarEstado}
        />
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <Etiqueta tono={visual.tono}>{visual.etiqueta}</Etiqueta>
        {mesa.totalAbierto > 0 && (
          <p className="pn-num text-xl font-semibold">{formatCurrency(mesa.totalAbierto)}</p>
        )}
      </div>

      {falla && (
        <div className="mb-3">
          <AvisoError>{falla}</AvisoError>
        </div>
      )}

      {cobrando && mesa.pedidos.length > 0 && (
        <div className="mb-4">
          <CobroMesa
            pedidos={mesa.pedidos}
            onCobrado={() => {
              setCobrando(false);
              onCambio();
            }}
          />
        </div>
      )}

      {mesa.pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no pidieron"
          detalle="Tomá el pedido con el botón de abajo y se manda directo a cocina."
        />
      ) : (
        <div className="space-y-3">
          {mesa.pedidos.map((p) => (
            <ComandaDetalle key={p.id} pedido={p} onCambio={onCambio} />
          ))}
        </div>
      )}
    </Hoja>
  );
}
