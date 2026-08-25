"use client";

import { useState } from "react";
import { ETIQUETA_ESTADO, type EstadoReserva } from "@/lib/reservas/estados";
import { actualizarReserva } from "./accionReserva";
import { contacto, type ReservaApi } from "./tipos";

const COLOR: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmada: "bg-green-100 text-green-800",
  sentada: "bg-blue-100 text-blue-800",
  cancelada: "bg-zinc-100 text-zinc-600",
  no_show: "bg-red-100 text-red-800",
};

// Acciones disponibles según el estado actual.
const ACCIONES: Record<string, { estado: EstadoReserva; label: string }[]> = {
  pendiente: [
    { estado: "confirmada", label: "Confirmar" },
    { estado: "cancelada", label: "Cancelar" },
  ],
  confirmada: [
    { estado: "sentada", label: "Sentar" },
    { estado: "no_show", label: "No vino" },
    { estado: "cancelada", label: "Cancelar" },
  ],
  sentada: [{ estado: "cancelada", label: "Cancelar" }],
};

function horaLegible(hora: string): string {
  const d = new Date(hora);
  return isNaN(d.getTime()) ? hora : d.toISOString().slice(11, 16);
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
    else setError(r.mensaje ?? "Error");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 p-3">
      <div className="w-16 shrink-0 text-center">
        <div className="font-semibold tabular-nums">{horaLegible(reserva.hora)}</div>
        <div className="text-xs text-zinc-500">{reserva.cantidadPersonas} pers.</div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-medium">{nombre}</div>
        <div className="text-xs text-zinc-500">
          {telefono ?? "sin teléfono"}
          {reserva.mesa ? ` · Mesa ${reserva.mesa.numero}` : reserva.zona ? ` · ${reserva.zona}` : ""}
        </div>
        {reserva.notas && <div className="mt-0.5 text-xs italic text-zinc-500">{reserva.notas}</div>}
      </div>

      <span className={`rounded-full px-2 py-1 text-xs font-medium ${COLOR[reserva.estado] ?? "bg-zinc-100"}`}>
        {ETIQUETA_ESTADO[reserva.estado as EstadoReserva] ?? reserva.estado}
      </span>

      <div className="flex gap-2">
        {acciones.map((a) => (
          <button
            key={a.estado}
            onClick={() => cambiar(a.estado)}
            disabled={ocupado}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-40"
          >
            {a.label}
          </button>
        ))}
      </div>

      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
