"use client";

import { useState } from "react";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Filtros from "../ui/Filtros";
import AgendaTurnos from "./AgendaTurnos";
import ListaPersonal from "./ListaPersonal";
import AsistenciaHoy from "./AsistenciaHoy";

const VISTAS: Record<string, string> = {
  turnos: "Quién trabaja cada día.",
  personal: "Las personas del equipo y su cargo.",
  asistencia: "Quién fichó hoy.",
};

export default function PanelEquipo() {
  const [vista, setVista] = useState("turnos");

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina titulo="Equipo" descripcion={VISTAS[vista]} />
      <div className="mb-5">
        <Filtros
          aria-label="Sección del equipo"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: "turnos", etiqueta: "Turnos" },
            { valor: "personal", etiqueta: "Personal" },
            { valor: "asistencia", etiqueta: "Hoy" },
          ]}
        />
      </div>
      {vista === "turnos" && <AgendaTurnos />}
      {vista === "personal" && <ListaPersonal />}
      {vista === "asistencia" && <AsistenciaHoy />}
    </div>
  );
}
