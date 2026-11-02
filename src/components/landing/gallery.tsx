"use client";

import Link from "next/link";
import { SectionTitle } from "./ui";
import FotoProducto from "@/components/producto/FotoProducto";
import { useLandingData } from "@/lib/landing-data";

// "Momento delicioso": un acceso por cada sección de la carta. La foto es la de
// un producto real de esa sección y el toque lleva directo a ese sector de /menu.
export default function Gallery() {
  const { data } = useLandingData();
  const categorias = (data?.carta ?? []).filter((c) => c.productos.length > 0);

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-head">
        <SectionTitle
          eyebrow="En vivo desde la cocina"
          eyebrowColor="var(--red)"
          titleA="Momento"
          titleB="delicioso"
          titleBColor="var(--purple)"
        />
      </div>

      <div className="gallery-grid">
        {categorias.map((c, i) => {
          const portada = c.productos.find((p) => p.destacado) ?? c.productos[0];
          return (
            <Link
              key={c.id}
              href={`/menu#cat-${c.id}`}
              className="gallery-item pop-card reveal-scale"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <FotoProducto imagenUrl={portada.imagenUrl} alt={c.nombre} />
              <span className="gallery-caption">
                <span className="gallery-dot" />
                {c.nombre}
                <span className="gallery-more">
                  {c.productos.length} {c.productos.length === 1 ? "sabor" : "sabores"} →
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
