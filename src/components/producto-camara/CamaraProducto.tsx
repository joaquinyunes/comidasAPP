import type { TamanoResuelto } from "./tamano-estimado";
import { ETIQUETA_MEDIDA } from "./tamano-estimado";

interface Props {
  url: string;
  nombre: string;
  tamano: TamanoResuelto;
  pxPorCm: number;
  offset: { x: number; y: number };
  // true cuando el recorte falló y se usa la imagen original con su fondo.
  mezclar: boolean;
}

// El producto "apoyado" sobre la cámara, a escala real (ancho = cm × px/cm),
// con su línea de cota. Es decorativo respecto del gesto: el arrastre lo
// recibe el contenedor.
export default function CamaraProducto({ url, nombre, tamano, pxPorCm, offset, mezclar }: Props) {
  const ancho = Math.round(tamano.cm * pxPorCm);
  const etiqueta =
    tamano.tipo === "diametro"
      ? `Ø ${tamano.cm} cm`
      : `${ETIQUETA_MEDIDA[tamano.tipo]} ${tamano.cm} cm`;

  return (
    <div
      className="cam-producto"
      style={{ width: ancho, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- recorte en canvas: data URL, no pasa por el optimizador */}
      <img
        src={url}
        alt={nombre}
        draggable={false}
        className={`cam-producto-img ${mezclar ? "cam-mezclar" : ""}`}
      />
      <div className="cam-cota" aria-hidden="true">
        <span className="cam-cota-linea" />
        <span className="cam-cota-texto">
          {etiqueta}
          {tamano.estimado ? " · aprox." : ""}
        </span>
      </div>
    </div>
  );
}
