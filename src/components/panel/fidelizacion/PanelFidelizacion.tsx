"use client";

import { useState } from "react";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Filtros from "../ui/Filtros";
import EnLaMesa from "./EnLaMesa";
import ProgramaPuntos from "./ProgramaPuntos";

const AYUDA: Record<string, string> = {
  mesa: "Reconocé al cliente en su mesa, mirá sus alergias y sumale la visita.",
  programa: "Cómo anda el programa de puntos y quiénes vuelven más.",
};

export default function PanelFidelizacion() {
  const [vista, setVista] = useState("mesa");

  return (
    <div className="mx-auto max-w-4xl">
      <EncabezadoPagina titulo="Fidelización" descripcion={AYUDA[vista]} />
      <div className="mb-5">
        <Filtros
          aria-label="Sección de fidelización"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: "mesa", etiqueta: "En la mesa" },
            { valor: "programa", etiqueta: "Programa de puntos" },
          ]}
        />
      </div>
      {vista === "mesa" ? <EnLaMesa /> : <ProgramaPuntos />}
    </div>
  );
}
