"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Camera } from "lucide-react";
import type { ProductoCamara } from "./tipos";

// El visor (y su lógica de cámara) se baja recién cuando alguien lo abre.
const CamaraVisor = dynamic(() => import("./CamaraVisor"), { ssr: false });

type Variante = "flotante" | "fila" | "miniatura";

// Botón "ver en tu mesa". Se pone en cualquier tarjeta/fila de producto: el
// visor se arma solo con los datos disponibles (tamaño y "trae" se estiman
// si el producto no los trae cargados).
export default function BotonCamara({
  producto,
  variante = "flotante",
}: {
  producto: ProductoCamara;
  variante?: Variante;
}) {
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);

  return (
    <>
      <button
        type="button"
        className={`cam-boton cam-boton-${variante}`}
        onClick={() => setAbierto(true)}
        aria-label={`Ver ${producto.nombre} en tu mesa con la cámara`}
        title="Ver en tu mesa"
      >
        <Camera size={variante === "flotante" ? 18 : variante === "miniatura" ? 14 : 16} aria-hidden="true" />
        {variante === "flotante" && <span>Ver en tu mesa</span>}
      </button>
      {abierto && <CamaraVisor producto={producto} onCerrar={cerrar} />}
    </>
  );
}
