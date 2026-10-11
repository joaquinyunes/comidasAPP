"use client";

import { useState } from "react";
import { ETIQUETA_ESTADO, type EstadoReserva } from "@/lib/reservas/estados";
import Boton from "@/components/panel/ui/Boton";
import Etiqueta from "@/components/panel/ui/Etiqueta";
import type { Tono } from "@/components/panel/tonos";
import { actualizarReserva } from "./accionReserva";
import { contacto, type ReservaApi } from "./tipos";

const TONO: Record<string, Tono> = {
  pendiente: "aviso",
  confirmada: "ok",
  sentada: "info",
  cancelada: "neutro",
  no_show: "peligro",
};

// Acciones disponibles según el estado actual.
const ACCIONES: Record<string, { estado: EstadoReserva; etiqueta: string; principal?: boolean }[]> = {
  pendiente: [
    { estado: "confirmada", etiqueta: "Confirmar", principal: true },
    { estado: "cancelada", etiqueta: "Cancelar" },
  ],
  confirmada: [
    { estado: "sentada", etiqueta: "Sentar", principal: true },
    { estado: "no_show", etiqueta: "No vino" },
    { estado: "cancelada", etiqueta: "Cancelar" },
  ],
  sentada: [{ estado: "cancelada", etiqueta: "Cancelar" }],
};

function horaLegible(hora: string): string {
  const d = new Date(hora);
  return Number.isNaN(d.getTime()) ? hora : d.toISOString().slice(11, 16);
}

interface Props {
  reserva: ReservaApi;
  onCambio: () => void;
}

export default function ReservaFila({ reserva, onCambio }: Props) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nombre, telefono } = contacto(reserva);
  const acciones = ACCIONES[reserva.estado] ?? [];

  async function cambiar(estado: EstadoReserva) {
    setOcupado(true);
    setError(null);
    const r = await actualizarReserva(reserva.id, { estado });
    setOcupado(false);
    if (r.ok) onCambio();
    else setError(r.mensaje ?? "No se pudo actualizar la reserva.");
  }

  return (
    <li className="rounded-lg border border-pn-linea bg-pn-papel p-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="w-16 shrink-0">
          <p className="pn-num text-lg font-semibold leading-none">{horaLegible(reserva.hora)}</p>
          <p className="mt-1 text-xs text-pn-suave">{reserva.cantidadPersonas} personas</p>
        </div>

        <div className="min-w-0 flex-1 basis-48">
          <p className="font-medium">{nombre}</p>
          <p className="text-sm text-pn-suave">
            {telefono ?? "Sin teléfono"}
            {reserva.mesa ? ` · Mesa ${reserva.mesa.numero}` : reserva.zona ? ` · ${reserva.zona}` : ""}
          </p>
          {reserva.notas && <p className="mt-1 text-sm italic text-pn-suave">{reserva.notas}</p>}
        </div>

        <Etiqueta tono={TONO[reserva.estado] ?? "neutro"}>
          {ETIQUETA_ESTADO[reserva.estado as EstadoReserva] ?? reserva.estado}
        </Etiqueta>
      </div>

      {acciones.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-pn-linea pt-3">
          {acciones.map((a) => (
            <Boton
              key={a.estado}
              variante={a.principal ? "primario" : a.estado === "cancelada" || a.estado === "no_show" ? "peligro" : "secundario"}
              disabled={ocupado}
              onClick={() => cambiar(a.estado)}
            >
              {a.etiqueta}
            </Boton>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-pn-peligro">{error}</p>}
    </li>
  );
}
