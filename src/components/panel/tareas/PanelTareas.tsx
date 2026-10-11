"use client";

import { useState } from "react";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Filtros from "../ui/Filtros";
import TableroFichaje from "./TableroFichaje";
import ListaChecklists from "./ListaChecklists";
import RendimientoPersonal from "./RendimientoPersonal";

const AYUDA: Record<string, string> = {
  fichaje: "Quién está trabajando ahora y quién falta.",
  checklists: "Listas de apertura y cierre: se tilda lo que se hizo y queda registrado.",
  rendimiento: "Lo que produjo cada persona esta semana.",
};

export default function PanelTareas() {
  const [vista, setVista] = useState("fichaje");

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina titulo="Tareas y fichaje" descripcion={AYUDA[vista]} />
      <div className="mb-5">
        <Filtros
          aria-label="Sección"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: "fichaje", etiqueta: "Fichaje" },
            { valor: "checklists", etiqueta: "Checklists" },
            { valor: "rendimiento", etiqueta: "Rendimiento" },
          ]}
        />
      </div>
      {vista === "fichaje" && <TableroFichaje />}
      {vista === "checklists" && <ListaChecklists />}
      {vista === "rendimiento" && <RendimientoPersonal />}
    </div>
  );
}
