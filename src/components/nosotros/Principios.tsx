"use client";

import { PRINCIPIOS } from "./historia-capitulos";
import PrincipioTarjeta from "./PrincipioTarjeta";

// Cierre de la historia: lo que se mantiene igual aunque todo lo demás crezca.
// La entrada por scroll (`data-rev`) la resuelve useRevelar en la página.
export default function Principios() {
  return (
    <section className="principios carta-contenedor" id="principios">
      <header className="principios-cab" data-rev="">
        <p className="carta-sec-sector">Lo que no cambia</p>
        <h2 className="carta-orbita-titulo">Crecimos, pero la cocina es la misma</h2>
      </header>
      <div className="principios-grilla carta-grilla">
        {PRINCIPIOS.map((p) => (
          <PrincipioTarjeta key={p.id} principio={p} />
        ))}
      </div>
    </section>
  );
}
