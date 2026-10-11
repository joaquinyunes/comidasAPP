import { TARJETA_CM } from "./escala";

// Silueta de una tarjeta (8,56 × 5,4 cm) a la misma escala que el producto.
// El usuario apoya una tarjeta real en la mesa y ajusta hasta que coinciden:
// ahí el producto está a tamaño real.
export default function CamaraTarjetaReferencia({ pxPorCm }: { pxPorCm: number }) {
  return (
    <div
      className="cam-tarjeta"
      style={{ width: TARJETA_CM.ancho * pxPorCm, height: TARJETA_CM.alto * pxPorCm }}
      aria-hidden="true"
    >
      <span className="cam-tarjeta-chip" />
      <span className="cam-tarjeta-texto">8,5 cm</span>
    </div>
  );
}
