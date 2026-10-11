"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagenThumb } from "@/components/landing/Imagen";
import type { ProductoLanding } from "@/lib/landing-data";
import type { EstiloVars } from "./estilo-vars";
import { formatearPrecio } from "./formatear-precio";
import { irAProducto } from "./ir-a-producto";
import { pasoGrados } from "./orbita-geometria";
import { useOrbita } from "./use-orbita";

// Anillo 3D de platos que giran alrededor de un núcleo luminoso. Se arrastra
// con el mouse/dedo, tiene flechas, pausa al apuntarlo y, al tocar un plato,
// te lleva a su tarjeta en la carta.
export default function Orbita({ productos }: { productos: ProductoLanding[] }) {
  const total = productos.length;
  const { anilloRef, escenaRef, frente, girar, pausar, manejadores } = useOrbita(total);
  const paso = pasoGrados(total);
  const actual = productos[frente] ?? productos[0];

  return (
    <section className="carta-orbita" aria-label="Platos en órbita">
      <header className="carta-orbita-cab">
        <p className="carta-sec-sector">Destacados</p>
        <h2 className="carta-orbita-titulo">Los favoritos, en órbita</h2>
        <p className="carta-orbita-ayuda">Arrastrá el anillo y tocá un plato para ir a él.</p>
      </header>
      <div
        ref={escenaRef}
        className="carta-orbita-escena"
        onPointerEnter={() => pausar(true)}
        onPointerLeave={() => pausar(false)}
        onFocus={() => pausar(true)}
        onBlur={() => pausar(false)}
        {...manejadores}
      >
        <span className="carta-orbita-nucleo" aria-hidden="true" />
        <span className="carta-orbita-pista" aria-hidden="true" />
        <div ref={anilloRef} className="carta-orbita-anillo">
          {productos.map((p, i) => {
            const estilo: EstiloVars = { "--a": `${(i * paso).toFixed(2)}deg` };
            return (
              <div key={p.id} className="carta-orbita-item" style={estilo}>
                <button
                  type="button"
                  className="carta-orbita-medalla"
                  onClick={() => irAProducto(p.id)}
                  aria-label={`Ver ${p.nombre} en la carta`}
                >
                  {p.imagenUrl ? (
                    <ImagenThumb
                      className="carta-orbita-img"
                      src={p.imagenUrl}
                      alt=""
                      size={176}
                      eager
                    />
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="carta-orbita-pie">
        <button
          type="button"
          className="carta-orbita-flecha"
          onClick={() => girar(-1)}
          aria-label="Plato anterior"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="carta-orbita-actual" aria-live="polite">
          <span className="carta-orbita-etiqueta">En órbita</span>
          <strong>{actual?.nombre}</strong>
          <span className="carta-precio">{formatearPrecio(actual?.precio)}</span>
        </div>
        <button
          type="button"
          className="carta-orbita-flecha"
          onClick={() => girar(1)}
          aria-label="Plato siguiente"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
