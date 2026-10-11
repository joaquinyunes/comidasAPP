"use client";

import { useId, useState } from "react";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import CampoTexto from "../marketing/CampoTexto";
import type { EmpleadoApi } from "./tipos";

interface Props {
  personal: EmpleadoApi[];
  onCerrar: () => void;
  onCreado: () => void;
}

export default function FormularioTurno({ personal, onCerrar, onCreado }: Props) {
  const idEmpleado = useId();
  const [empleadoId, setEmpleadoId] = useState(personal[0]?.id ?? "");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [inicio, setInicio] = useState("12:00");
  const [fin, setFin] = useState("20:00");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empleado = personal.find((p) => p.id === empleadoId);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!empleado) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/rrhh/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empleadoId: empleado.id,
          sucursalId: empleado.sucursalId,
          fecha,
          horaInicio: inicio,
          horaFin: fin,
        }),
      });
      if (res.ok) {
        onCreado();
        return;
      }
      const json = await res.json().catch(() => ({}));
      setError(json?.error ?? "No se pudo cargar el turno.");
    } catch {
      setError("Sin conexión.");
    }
    setEnviando(false);
  }

  return (
    <Hoja titulo="Nuevo turno" subtitulo="Quién trabaja, cuándo y hasta qué hora" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label htmlFor={idEmpleado} className="mb-1.5 block text-sm font-medium">
            Persona
          </label>
          <select
            id={idEmpleado}
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
          >
            {personal.map((p) => (
              <option key={p.id} value={p.id}>
                {p.usuario.nombre}
                {p.cargo ? ` · ${p.cargo}` : ""}
              </option>
            ))}
          </select>
        </div>
        <CampoTexto etiqueta="Día" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto etiqueta="Entra" type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          <CampoTexto etiqueta="Sale" type="time" value={fin} onChange={(e) => setFin(e.target.value)} />
        </div>

        {error && <AvisoError>{error}</AvisoError>}

        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!empleado || enviando}>
          {enviando ? "Guardando…" : "Cargar turno"}
        </Boton>
      </form>
    </Hoja>
  );
}
