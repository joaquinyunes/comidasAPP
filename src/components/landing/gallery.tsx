"use client";

import { SectionTitle } from "./ui";
import { ImagenCover } from "./Imagen";

const galleryItems = [
  { src: "/assets/gallery-doble-queso.png", caption: "Doble queso" },
  { src: "/assets/gallery-parrilla.png", caption: "A la parrilla" },
  { src: "/assets/gallery-toppings.png", caption: "Ingredientes frescos" },
  { src: "/assets/gallery-fritas.png", caption: "Comet Fries" },
  { src: "/assets/gallery-horno.png", caption: "Recién horneada" },
  { src: "/assets/gallery-combo-tray.png", caption: "Bandeja completa" },
  { src: "/assets/gallery-entrega.png", caption: "Entrega cósmica" },
  { src: "/assets/gallery-equipo.png", caption: "Nuestro equipo" },
];

export default function Gallery() {
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
        {galleryItems.map((g, i) => (
          <figure className="gallery-item pop-card reveal-scale" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
            <ImagenCover src={g.src} alt={g.caption} />
            <figcaption className="gallery-caption">
              <span className="gallery-dot" />
              {g.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}