"use client";

import { useRef } from "react";
import { SectionTitle } from "./ui";
import { useIngredientsScrolly } from "./animations/use-ingredients-scrolly";

const ingredients = [
  {
    name: "Pan",
    desc: "Suave, dorado y recién horneado cada mañana.",
    color: "#F6BE3B",
    foto: "/assets/real/ingrediente-pan.webp",
  },
  {
    name: "Carne",
    desc: "Angus premium, jugosa y cocinada a la perfección.",
    color: "#8A4A2F",
    foto: "/assets/real/ingrediente-carne.webp",
  },
  {
    name: "Queso",
    desc: "Cheddar fundido que estira como un cable galáctico.",
    color: "#FFC800",
    foto: "/assets/real/ingrediente-queso.webp",
  },
  {
    name: "Tomate",
    desc: "Fresco, rojo y lleno de sabor en cada mordida.",
    color: "#EF4136",
    foto: "/assets/real/ingrediente-tomate.webp",
  },
  {
    name: "Lechuga",
    desc: "Crujiente y verde, traída fresquita cada día.",
    color: "#67C158",
    foto: "/assets/real/ingrediente-lechuga.webp",
  },
  {
    name: "Salsas",
    desc: "Recetas secretas que explotan en tu paladar.",
    color: "#EF4136",
    foto: "/assets/real/ingrediente-salsas.webp",
  },
];

export default function Ingredients() {
  const sectionRef = useRef<HTMLElement>(null);
  useIngredientsScrolly(sectionRef);

  return (
    <section className="ingredients-section" id="ingredients" ref={sectionRef}>
      <div className="ingredients-head">
        <SectionTitle
          eyebrow="La materia prima"
          eyebrowColor="var(--orange)"
          titleA="Ingredientes"
          titleB="de estrella"
          titleBColor="var(--purple)"
        />
        <p className="ingredients-sub reveal-up">
          Cada elemento llega fresco a tu plato, todos los días.
        </p>
      </div>

      <div className="ingredients-grid">
        {ingredients.map((ing, i) => (
          <article className="ingredient-card pop-card reveal-scale" key={ing.name}>
            <div className="ingredient-foto">
              {/* eslint-disable-next-line @next/next/no-img-element -- webp local de 640px, sin optimizador */}
              <img src={ing.foto} alt={ing.name} loading="lazy" decoding="async" />
              <div className="ingredient-num" style={{ background: ing.color }}>
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
            <div className="ingredient-cuerpo">
              <h3 className="font-display ingredient-name">{ing.name}</h3>
              <p className="ingredient-desc">{ing.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="ingredients-flow reveal-up">
        {ingredients.map((ing, i) => (
          <span key={ing.name} className="ingredient-flow-pill" style={{ borderColor: ing.color }}>
            {ing.name}
            {i < ingredients.length - 1 && <span className="ingredient-flow-arrow">→</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
