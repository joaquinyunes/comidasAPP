"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLandingData } from "@/lib/landing-data";
import Aislar from "./Aislar";
import CartaCabecera from "./CartaCabecera";
import { CartaCargando, CartaError, CartaVacia } from "./CartaEstados";
import CartaViaje from "./CartaViaje";
import MarcoPagina from "./MarcoPagina";
import NavCategorias from "./NavCategorias";
import Orbita from "./Orbita";
import Seccion from "./Seccion";
import { elegirOrbita } from "./elegir-orbita";
import { useCategoriaActiva } from "./use-categoria-activa";
import { useRevelar } from "./use-revelar";

// Página /menu: la carta con el viaje por la galaxia como portada y, debajo,
// el estilo pop del home. Esta pieza sólo compone; cada efecto vive en su
// propio componente/hook y las capas decorativas van aisladas para que un
// fallo no tire la carta.
export default function CartaPagina() {
  const { data, loading, error } = useLandingData();
  const mainRef = useRef<HTMLElement>(null);

  const categorias = data?.carta.filter((c) => c.productos.length > 0) ?? [];
  const sabores = categorias.reduce((n, c) => n + c.productos.length, 0);
  const orbita = elegirOrbita(categorias);
  const meteoros = elegirOrbita(categorias, 9);
  const hayCarta = categorias.length > 0;

  const activa = useCategoriaActiva(categorias.map((c) => `cat-${c.id}`));
  useRevelar(mainRef, hayCarta);

  const cabecera = <CartaCabecera sabores={sabores} sectores={categorias.length} />;

  return (
    <MarcoPagina portadaOscura={hayCarta}>
      <main ref={mainRef} className="carta-main">
        {hayCarta ? (
          <Aislar respaldo={<div className="carta-contenedor carta-contenedor-tope">{cabecera}</div>}>
            <CartaViaje categorias={categorias} meteoros={meteoros} cabecera={cabecera} />
          </Aislar>
        ) : (
          <div className="carta-contenedor carta-contenedor-tope">
            {cabecera}
            {loading && <CartaCargando />}
            {error && <CartaError />}
            {!loading && !error && <CartaVacia />}
          </div>
        )}

        {hayCarta && (
          <div className="carta-contenedor" id="carta-contenido">
            {orbita.length >= 3 && (
              <Aislar>
                <Orbita productos={orbita} />
              </Aislar>
            )}

            <NavCategorias categorias={categorias} activa={activa} />
            {categorias.map((c, i) => (
              <Seccion key={c.id} categoria={c} numero={i + 1} />
            ))}
          </div>
        )}

        <aside className="carta-contenedor carta-cierre-caja">
          <div className="carta-cierre" data-rev="zoom">
            <h2 className="font-display">¿Ya elegiste tu destino?</h2>
            <p>Pedí a domicilio, retirá o reservá tu mesa. Despegamos en minutos.</p>
            <div className="carta-cierre-botones">
              <Link href="/ordenar" className="carta-boton carta-boton-principal">
                Ordenar ahora
              </Link>
              <Link href="/reservar" className="carta-boton">
                Reservar mesa
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </MarcoPagina>
  );
}
