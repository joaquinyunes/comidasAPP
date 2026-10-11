"use client";

import type { CategoriaLanding } from "@/lib/landing-data";
import type { EstiloVars } from "./estilo-vars";
import Tarjeta from "./Tarjeta";
import { temaDeCategoria } from "./tema-categoria";

// Una categoría de la carta = un "sector" con su propio planeta y paleta.
// La entrada por scroll (`data-rev`) la resuelve useRevelar en la página.
export default function Seccion({
  categoria,
  numero,
}: {
  categoria: CategoriaLanding;
  numero: number;
}) {
  const tema = temaDeCategoria(categoria.nombre, numero - 1);
  const estilo: EstiloVars = { "--c1": tema.color1, "--c2": tema.color2 };
  const cuenta = categoria.productos.length;
  const num = String(numero).padStart(2, "0");

  return (
    <section id={`cat-${categoria.id}`} className="carta-sec" style={estilo}>
      <header className="carta-sec-cab" data-rev="">
        <span className="carta-sec-num" aria-hidden="true">
          {num}
        </span>
        <div className="carta-planeta" aria-hidden="true">
          <span className="carta-planeta-anillo" />
        </div>
        <div className="carta-sec-textos">
          <p className="carta-sec-sector">
            Sector {num} · {tema.planeta}
          </p>
          <h2 className="carta-sec-titulo">{categoria.nombre}</h2>
          {categoria.descripcion ? <p className="carta-sec-desc">{categoria.descripcion}</p> : null}
        </div>
        <span className="carta-sec-cuenta">
          {cuenta} {cuenta === 1 ? "sabor" : "sabores"}
        </span>
      </header>

      <div className="carta-grilla">
        {categoria.productos.map((p) => (
          <div key={p.id} className="carta-celda" data-rev="">
            <Tarjeta producto={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
