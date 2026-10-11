"use client";

import { Imagen } from "./Imagen";

const PIEZAS = [
  { id: "burger", img: "/assets/3d/hero-galaxy-bite.webp", alt: "Galaxy Bite, la burger cósmica", desde: "arriba", depth: 1 },
  { id: "papas", img: "/assets/3d/comet-fries.webp", alt: "Comet Fries", desde: "der", depth: 1.5 },
  { id: "bebida", img: "/assets/3d/nebula-soda.webp", alt: "Bebida cósmica", desde: "izq", depth: 1.3 },
] as const;

// Escenario del combo: la burger sale disparada con un cohete, las papas y la
// bebida orbitan alrededor y una insignia de descuento gira detrás. Capas con
// data-depth (parallax con el puntero) > data-pieza (entrada armada por
// scroll) > .especiales-flota (flote CSS) para que nunca se pisen transforms.
export default function SpecialsCombo() {
  return (
    <div className="especiales-escena" aria-label="Combo Galaxia: burger, papas y bebida">
      <div className="especiales-estallido" data-depth="0.25" aria-hidden="true">
        <span data-insignia className="especiales-estallido-forma" />
      </div>
      <span className="especiales-anillo" aria-hidden="true" />

      {PIEZAS.map((p) => (
        <div key={p.id} className={`especiales-par especiales-par-${p.id}`} data-depth={p.depth}>
          <div data-pieza data-desde={p.desde} className="especiales-pieza">
            <div className="especiales-flota">
              <Imagen src={p.img} alt={p.alt} className="especiales-img" />
            </div>
          </div>
        </div>
      ))}

      <span className="especiales-chispa especiales-chispa-1" aria-hidden="true">✦</span>
      <span className="especiales-chispa especiales-chispa-2" aria-hidden="true">✦</span>
      <span className="especiales-chispa especiales-chispa-3" aria-hidden="true">✦</span>

      <div data-insignia-texto className="especiales-descuento" aria-label="23% de descuento">
        <span>-23%</span>
      </div>
    </div>
  );
}
