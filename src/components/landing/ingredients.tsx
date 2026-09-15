"use client";

import { useRef } from "react";
import { SectionTitle } from "./ui";
import {
  IllustrationBun,
  IllustrationMeat,
  IllustrationCheese,
  IllustrationTomato,
  IllustrationLettuce,
  IllustrationSauce,
} from "./illustrations";
import { useIngredientsScrolly } from "./animations/use-ingredients-scrolly";

const ingredients = [
  {
    name: "Pan",
    desc: "Suave, dorado y recién horneado cada mañana.",
    color: "#F6BE3B",
    illustration: <IllustrationBun />,
  },
  {
    name: "Carne",
    desc: "Angus premium, jugosa y cocinada a la perfección.",
    color: "#8A4A2F",
    illustration: <IllustrationMeat />,
  },
  {
    name: "Queso",
    desc: "Cheddar fundido que estira como un cable galáctico.",
    color: "#FFC800",
    illustration: <IllustrationCheese />,
  },
  {
    name: "Tomate",
    desc: "Fresco, rojo y lleno de sabor en cada mordida.",
    color: "#EF4136",
    illustration: <IllustrationTomato />,
  },
  {
    name: "Lechuga",
    desc: "Crujiente y verde, traída fresquita cada día.",
    color: "#67C158",
    illustration: <IllustrationLettuce />,
  },
  {
    name: "Salsas",
    desc: "Recetas secretas que explotan en tu paladar.",
    color: "#EF4136",
    illustration: <IllustrationSauce />,
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
            <div className="ingredient-illu float-anim" style={{ animationDelay: `${i * 0.3}s` }}>
              {ing.illustration}
            </div>
            <div className="ingredient-num" style={{ background: ing.color }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-display ingredient-name">{ing.name}</h3>
            <p className="ingredient-desc">{ing.desc}</p>
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