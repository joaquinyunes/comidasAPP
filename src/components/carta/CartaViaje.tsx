"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { ImagenThumb } from "@/components/landing/Imagen";
import type { CategoriaLanding, ProductoLanding } from "@/lib/landing-data";
import type { EstiloVars } from "./estilo-vars";
import { temaDeCategoria } from "./tema-categoria";
import { useViajeScroll } from "./use-viaje-scroll";
import { posicionMeteoro, posicionPlaneta } from "./viaje-geometria";

// Portada de la carta: una sección alta con escenario "sticky" — la única
// parte "espacial" de la página. Al scrollear, la cámara avanza por la galaxia
// y pasa junto a un planeta por sector (con los platos volando entre ellos).
// Cada planeta es un link a su sector.
export default function CartaViaje({
  categorias,
  meteoros,
  cabecera,
}: {
  categorias: CategoriaLanding[];
  meteoros: ProductoLanding[];
  cabecera: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [sector, setSector] = useState<number | null>(null);
  const total = categorias.length;

  const alCambiarSector = useCallback((i: number | null) => setSector(i), []);

  useViajeScroll(sectionRef, total, meteoros.length, alCambiarSector);

  const indice = sector ?? 0;
  const actual = categorias[indice];
  const tema = temaDeCategoria(actual?.nombre ?? "", indice);
  const estiloSector: EstiloVars = { "--c1": tema.color1, "--c2": tema.color2 };
  const alto: EstiloVars = { "--sectores": total };

  return (
    <section ref={sectionRef} className="carta-viaje" id="viaje" style={alto}>
      <div className="carta-viaje-sticky">
        <div className="carta-viaje-estrellas carta-viaje-estrellas-lejos" aria-hidden="true" />
        <div className="carta-viaje-estrellas carta-viaje-estrellas-cerca" aria-hidden="true" />
        <div className="carta-viaje-escena">
          <div className="carta-viaje-mundo">
            {meteoros.map((p, m) => {
              const pos = posicionMeteoro(m, meteoros.length, total);
              const estilo: EstiloVars = {
                transform: `translate3d(${pos.x}vw, ${pos.y}vh, ${pos.z}px) translate(-50%, -50%)`,
              };
              return (
                <span key={p.id} data-meteoro className="carta-viaje-meteoro" style={estilo}>
                  <ImagenThumb
                    className="carta-viaje-meteoro-img"
                    src={p.imagenUrl ?? ""}
                    alt=""
                    size={160}
                    eager
                  />
                </span>
              );
            })}

            {categorias.map((c, i) => {
              const t = temaDeCategoria(c.nombre, i);
              const pos = posicionPlaneta(i);
              const estilo: EstiloVars = {
                "--c1": t.color1,
                "--c2": t.color2,
                transform: `translate3d(${pos.x}vw, ${pos.y}vh, ${pos.z}px) translate(-50%, -50%)`,
              };
              const n = c.productos.length;
              return (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  data-planeta
                  className="carta-viaje-planeta"
                  style={estilo}
                  aria-label={`${c.nombre}: ${n} ${n === 1 ? "sabor" : "sabores"}. Ir al sector`}
                >
                  <span className="carta-planeta" aria-hidden="true">
                    <span className="carta-planeta-anillo" />
                  </span>
                  <span className="carta-viaje-rotulo">
                    <small>
                      Sector {String(i + 1).padStart(2, "0")} · {t.planeta}
                    </small>
                    <strong>{c.nombre}</strong>
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="carta-viaje-copy-wrap">
          <div className="carta-viaje-copy">{cabecera}</div>
        </div>

        <div className="carta-viaje-caption" style={estiloSector} aria-live="polite">
          <span className="carta-viaje-caption-sector">
            Sector {String(indice + 1).padStart(2, "0")} · {tema.planeta}
          </span>
          <strong>{actual?.nombre}</strong>
          <span className="carta-viaje-caption-cuenta">
            {actual?.productos.length ?? 0} sabores
          </span>
        </div>

        <div className="carta-viaje-hint">
          <span className="carta-viaje-hint-mouse" aria-hidden="true" />
          <span>Scrolleá para viajar</span>
          <a href="#carta-contenido" className="carta-viaje-saltar">
            Ir directo a la carta
          </a>
        </div>

        <a href="#carta-contenido" className="carta-viaje-final">
          Elegí tu sector ↓
        </a>

        <div className="carta-viaje-riel" aria-hidden="true">
          <span className="carta-viaje-riel-fill" />
        </div>
      </div>
    </section>
  );
}
