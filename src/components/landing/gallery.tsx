"use client";

import { SectionTitle } from "./ui";
import { ImagenCover } from "./Imagen";

const galleryItems = [
  { src: "/assets/galaxy-bite.png", caption: "Galaxy Bite", span: "tall" },
  { src: "/assets/hyperdog.png", caption: "Hyperdog", span: "wide" },
  { src: "/assets/pizzanaut.png", caption: "Pizzanaut", span: "" },
  { src: "/assets/galaxy-bite.png", caption: "Doble queso", span: "" },
  { src: "/assets/hyperdog.png", caption: "Cebolla crispy", span: "tall" },
  { src: "/assets/pizzanaut.png", caption: "Pepperoni cósmico", span: "wide" },
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
          <figure className={`gallery-item ${g.span} pop-card reveal-scale`} key={i} style={{ animationDelay: `${i * 0.05}s` }}>
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