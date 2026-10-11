"use client";

import { Imagen } from "@/components/landing/Imagen";
import type { EstiloVars } from "@/components/carta/estilo-vars";
import type { Principio } from "./historia-capitulos";

// Tarjeta de "lo que no cambia": mismo lenguaje pop que las de la carta
// (borde negro, sombra dura, imagen sobre un círculo de color).
export default function PrincipioTarjeta({ principio: p }: { principio: Principio }) {
  const estilo: EstiloVars = { "--c1": p.color1, "--c2": p.color2 };

  return (
    <div className="principio-celda" data-rev="">
      <article className="carta-tarjeta principio" style={estilo}>
        <div className="carta-tarjeta-escena principio-escena">
          <span className="carta-tarjeta-halo" aria-hidden="true" />
          <div className="principio-imagen">
            <Imagen src={p.imagen} alt={p.alt} />
          </div>
        </div>
        <div className="carta-tarjeta-cuerpo">
          <h3 className="carta-tarjeta-nombre principio-titulo">{p.titulo}</h3>
          <p className="carta-tarjeta-desc">{p.texto}</p>
        </div>
      </article>
    </div>
  );
}
