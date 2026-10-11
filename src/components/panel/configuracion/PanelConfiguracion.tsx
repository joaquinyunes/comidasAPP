"use client";

import { useState } from "react";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Filtros from "../ui/Filtros";
import FormularioLocal from "./FormularioLocal";
import ListaAccesos from "./ListaAccesos";
import ConfiguracionSalon from "./ConfiguracionSalon";

const AYUDA: Record<string, string> = {
  local: "Datos del negocio y del local que ven los clientes.",
  accesos: "Quién entra al panel y qué puede hacer cada uno.",
  salon: "Sectores y mesas del salón.",
};

export default function PanelConfiguracion() {
  const [vista, setVista] = useState("local");

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina titulo="Configuración" descripcion={AYUDA[vista]} />
      <div className="mb-5">
        <Filtros
          aria-label="Sección de configuración"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: "local", etiqueta: "Local" },
            { valor: "accesos", etiqueta: "Accesos" },
            { valor: "salon", etiqueta: "Salón" },
          ]}
        />
      </div>
      {vista === "local" && <FormularioLocal />}
      {vista === "accesos" && <ListaAccesos />}
      {vista === "salon" && <ConfiguracionSalon />}
    </div>
  );
}
