"use client";

import { useRef } from "react";
import Link from "next/link";
import MarcoPagina from "@/components/carta/MarcoPagina";
import { useRevelar } from "@/components/carta/use-revelar";
import HistoriaScroll from "./HistoriaScroll";
import Principios from "./Principios";

// Página /nosotros: la historia contada con scroll. Compone el marco
// compartido con la carta, el recorrido por capítulos y el cierre.
export default function NosotrosPagina() {
  const mainRef = useRef<HTMLElement>(null);
  useRevelar(mainRef, true);

  return (
    <MarcoPagina>
      <main ref={mainRef} className="carta-main">
        <HistoriaScroll />
        <Principios />

        <aside className="carta-contenedor carta-cierre-caja">
          <div className="carta-cierre" data-rev="zoom">
            <h2 className="font-display">Probá el sabor de la historia</h2>
            <p>Dos locales en Buenos Aires, cocina propia y reparto en la zona.</p>
            <div className="carta-cierre-botones">
              <Link href="/menu" className="carta-boton carta-boton-principal">
                Ver la carta
              </Link>
              <Link href="/ubicaciones" className="carta-boton">
                Dónde estamos
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </MarcoPagina>
  );
}
