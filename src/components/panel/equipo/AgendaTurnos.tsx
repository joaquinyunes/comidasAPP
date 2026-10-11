"use client";

import { useMemo, useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import { agruparPorDia, horaDe, horasDeTurno } from "@/lib/equipo/agenda";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import FormularioTurno from "./FormularioTurno";
import type { EmpleadoApi, TurnoApi } from "./tipos";

function tituloDia(dia: string, hoy: string): string {
  const d = new Date(`${dia}T12:00:00`);
  const texto = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  return dia === hoy ? `Hoy · ${texto}` : texto;
}

export default function AgendaTurnos() {
  const turnos = useDatos<TurnoApi[]>("/api/rrhh/turnos?limit=200", 0);
  const personal = useDatos<EmpleadoApi[]>("/api/rrhh/empleados?limit=100", 0);
  const [creando, setCreando] = useState(false);

  const hoy = new Date().toISOString().slice(0, 10);
  const dias = useMemo(() => agruparPorDia(turnos.datos ?? [], hoy), [turnos.datos, hoy]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Boton variante="primario" disabled={!personal.datos?.length} onClick={() => setCreando(true)}>
          Nuevo turno
        </Boton>
      </div>

      {turnos.error && !turnos.datos && <AvisoError onReintentar={turnos.recargar}>{turnos.error}</AvisoError>}
      {turnos.cargando && !turnos.datos && <p className="text-sm text-pn-suave">Cargando la agenda…</p>}
      {turnos.datos && dias.length === 0 && (
        <EstadoVacio titulo="No hay turnos cargados desde hoy" detalle="Cargá los turnos para saber quién entra cada día." />
      )}

      <div className="space-y-4">
        {dias.map((d) => (
          <Bloque key={d.dia} titulo={tituloDia(d.dia, hoy)} nota={`${d.turnos.length} ${d.turnos.length === 1 ? "turno" : "turnos"}`} sinPadding>
            <ul className="divide-y divide-pn-linea">
              {d.turnos.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                  <span className="font-medium">{t.empleado.usuario.nombre}</span>
                  <span className="flex items-center gap-2">
                    <span className="pn-num text-sm">
                      {horaDe(t.horaInicio)} – {horaDe(t.horaFin)}
                    </span>
                    <span className="pn-num text-xs text-pn-suave">
                      {horasDeTurno(horaDe(t.horaInicio), horaDe(t.horaFin))} h
                    </span>
                    {t.estado !== "asignado" && <Etiqueta>{t.estado.replace("_", " ")}</Etiqueta>}
                  </span>
                </li>
              ))}
            </ul>
          </Bloque>
        ))}
      </div>

      {creando && personal.datos && (
        <FormularioTurno
          personal={personal.datos}
          onCerrar={() => setCreando(false)}
          onCreado={() => {
            setCreando(false);
            void turnos.recargar();
          }}
        />
      )}
    </>
  );
}
