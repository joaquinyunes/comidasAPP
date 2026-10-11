"use client";

import { useRef, useState } from "react";
import { Imagen } from "@/components/landing/Imagen";
import { StickerBurst, StickerPlanet, StickerStar } from "@/components/landing/illustrations";
import type { EstiloVars } from "@/components/carta/estilo-vars";
import { CAPITULOS } from "./historia-capitulos";
import { useHistoriaScroll } from "./use-historia-scroll";

// La historia de Cozizina como un recorrido: sección alta con escenario
// sticky; al scrollear, cada capítulo trae su planeta con la imagen, su año
// y su texto. Fondo crema del home: el color de la galaxia sólo vive en el
// planeta de cada capítulo.
export default function HistoriaScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activo, setActivo] = useState<number | null>(null);
  const total = CAPITULOS.length;

  useHistoriaScroll(sectionRef, total, setActivo);

  const alto: EstiloVars = { "--capitulos": total };

  return (
    <section ref={sectionRef} className="historia" id="historia" style={alto}>
      <div className="historia-sticky">
        <div className="historia-deco historia-deco-1 float-anim" aria-hidden="true">
          <StickerStar color="#F6BE3B" size={58} />
        </div>
        <div className="historia-deco historia-deco-2 float-anim-delay-2 float-anim" aria-hidden="true">
          <StickerBurst color="#EF4136" size={74} />
        </div>
        <div className="historia-deco historia-deco-3 float-anim-delay-1 float-anim" aria-hidden="true">
          <StickerPlanet size={84} />
        </div>

        <div className="historia-intro">
          <span className="carta-eyebrow">✦ Nuestra historia</span>
          <h1 className="carta-titulo font-display">
            Comida al estilo <span>cósmico</span>
          </h1>
          <p className="carta-intro">
            Cozizina nació de una idea simple: comida rápida hecha en serio, con ingredientes
            frescos y sin vueltas. Scrolleá y te contamos cómo llegamos hasta acá.
          </p>
        </div>

        <div className="historia-anios" aria-hidden="true">
          {CAPITULOS.map((c, i) => {
            const estilo: EstiloVars = { "--c1": c.color1, "--c2": c.color2 };
            return (
              <span key={c.id} data-anio className="historia-anio" data-lado={i % 2 === 0 ? "izq" : "der"} style={estilo}>
                {c.anio}
              </span>
            );
          })}
        </div>

        <div className="historia-escena">
          {CAPITULOS.map((c, i) => {
            const estilo: EstiloVars = { "--c1": c.color1, "--c2": c.color2 };
            return (
              <figure
                key={c.id}
                data-lamina
                className="historia-lamina"
                data-lado={i % 2 === 0 ? "der" : "izq"}
                style={estilo}
              >
                <span className="historia-lamina-halo" aria-hidden="true" />
                <span className="historia-lamina-anillo" aria-hidden="true" />
                <div className="historia-lamina-flota">
                  <Imagen src={c.imagen} alt={c.alt} priority={i === 0} />
                </div>
              </figure>
            );
          })}
        </div>

        <div className="historia-textos">
          {CAPITULOS.map((c, i) => {
            const estilo: EstiloVars = { "--c1": c.color1, "--c2": c.color2 };
            return (
              <article
                key={c.id}
                data-texto
                className="historia-cap"
                data-lado={i % 2 === 0 ? "izq" : "der"}
                style={estilo}
              >
                <p className="historia-cap-etiqueta">{c.etiqueta}</p>
                <h2 className="historia-cap-titulo">{c.titulo}</h2>
                <p className="historia-cap-texto">{c.texto}</p>
              </article>
            );
          })}
        </div>

        <div className="historia-hint">
          <span className="carta-viaje-hint-mouse" aria-hidden="true" />
          <span>Scrolleá para viajar en el tiempo</span>
        </div>

        <div className="historia-riel">
          <span className="historia-riel-barra" aria-hidden="true">
            <span className="historia-riel-fill" />
          </span>
          <ol aria-label="Línea de tiempo">
            {CAPITULOS.map((c, i) => (
              <li key={c.id} data-activo={activo !== null && i <= activo ? "1" : undefined}>
                <span>{c.anio}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
