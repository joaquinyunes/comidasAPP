"use client";

import { useState } from "react";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Filtros from "../ui/Filtros";
import ListaCupones from "./ListaCupones";
import ListaCampanas from "./ListaCampanas";

// Promos para traer gente: cupones que se canjean al pedir y campañas que los comunican.
export default function PanelMarketing() {
  const [vista, setVista] = useState("cupones");

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina titulo="Marketing" descripcion="Cupones de descuento y campañas para comunicarlos." />
      <div className="mb-5">
        <Filtros
          aria-label="Sección de marketing"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: "cupones", etiqueta: "Cupones" },
            { valor: "campanas", etiqueta: "Campañas" },
          ]}
        />
      </div>
      {vista === "cupones" ? <ListaCupones /> : <ListaCampanas />}
    </div>
  );
}
