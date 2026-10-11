"use client";

import { ImagenThumb } from "@/components/landing/Imagen";
import BotonCamara from "@/components/producto-camara/BotonCamara";
import type { ProductoLanding } from "@/lib/landing-data";
import { formatearPrecio } from "./formatear-precio";

const PICANTE = ["", "🌶", "🌶🌶", "🌶🌶🌶"];

// Tarjeta de producto: estilo pop del home (borde negro, sombra dura), foto
// sobre un círculo del color del sector y botón de cámara. Sin efectos de
// pintura: sólo se mueve por transform al apuntarla.
export default function Tarjeta({ producto: p }: { producto: ProductoLanding }) {
  const picante = p.nivelPicante ? PICANTE[Math.min(p.nivelPicante, 3)] : "";

  return (
    <article
      id={`prod-${p.id}`}
      className="carta-tarjeta"
      data-destacado={p.destacado ? "1" : undefined}
    >
      <div className="carta-tarjeta-escena">
        <span className="carta-tarjeta-halo" aria-hidden="true" />
        <div className="cam-thumb carta-tarjeta-foto">
          {p.imagenUrl ? (
            <ImagenThumb className="carta-tarjeta-img" src={p.imagenUrl} alt={p.nombre} size={220} />
          ) : (
            <span className="carta-tarjeta-sinfoto" aria-hidden="true">✦</span>
          )}
          <BotonCamara producto={p} variante="miniatura" />
        </div>
        {p.destacado ? <span className="carta-sello">★ Favorito</span> : null}
      </div>

      <div className="carta-tarjeta-cuerpo">
        <div className="carta-tarjeta-linea">
          <h3 className="carta-tarjeta-nombre">{p.nombre}</h3>
          <span className="carta-precio">{formatearPrecio(p.precio)}</span>
        </div>
        {p.descripcion ? <p className="carta-tarjeta-desc">{p.descripcion}</p> : null}
        <ul className="carta-etiquetas">
          {picante ? <li>{picante}</li> : null}
          {p.tamanoCm ? <li>{p.tamanoCm} cm</li> : null}
          {p.tiempoPreparacionMin ? <li>{p.tiempoPreparacionMin} min</li> : null}
          {p.alergenos?.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
