"use client";

import { useMemo } from "react";
import { useDatos } from "@/hooks/use-datos";
import { formatTime } from "@/lib/utils";
import Bloque from "../ui/Bloque";
import Etiqueta from "../ui/Etiqueta";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import type { AsistenciaApi } from "./tipos";

// Quién fichó hoy y cuánto lleva (o trabajó).
export default function AsistenciaHoy() {
  const desde = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);
  const { datos, cargando, error, recargar } = useDatos<AsistenciaApi[]>(
    `/api/rrhh/asistencia?limit=100&desde=${encodeURIComponent(desde)}`,
    60000
  );

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando && !datos) return <p className="text-sm text-pn-suave">Cargando fichajes…</p>;
  const lista = datos ?? [];
  if (lista.length === 0) {
    return <EstadoVacio titulo="Nadie fichó hoy" detalle="Los fichajes aparecen acá cuando el equipo marca su entrada." />;
  }

  return (
    <Bloque sinPadding>
      <ul className="divide-y divide-pn-linea">
        {lista.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span className="font-medium">{a.empleado.usuario.nombre}</span>
            <span className="pn-num flex items-center gap-3 text-sm">
              <span>{a.entrada ? `Entró ${formatTime(a.entrada)}` : "Sin entrada"}</span>
              {a.salida ? (
                <span className="text-pn-suave">Salió {formatTime(a.salida)}</span>
              ) : (
                <Etiqueta tono="ok">En el local</Etiqueta>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Bloque>
  );
}
