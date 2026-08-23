"use client";

import { Sticker } from "./ui";
import { Imagen } from "./Imagen";
import { StickerStar, StickerBolt, StickerPlanet } from "./illustrations";

const milestones = [
  { year: "2019", text: "Nace Cozizina en un food truck cósmico en Palermo." },
  { year: "2021", text: "Abrimos nuestro primer local fijo sobre Corrientes." },
  { year: "2023", text: "Sumamos sucursal en Villa Crespo y envíos propios." },
  { year: "2025", text: "Más de 200 mil mordidas servidas. Y seguimos." },
];

export default function Story() {
  return (
    <section className="story-section" id="story">
      <div className="story-col story-text">
        <Sticker label="Nuestra historia" color="red" className="story-eyebrow" />
        <h2 className="font-display section-title-head reveal-up">
          Un viaje <span style={{ color: "var(--purple)" }}>galáctico</span>
        </h2>
        <p className="story-lead reveal-up">
          Empezamos con un sueño y una parrilla. Hoy, cientos de miles de
          mordidas después, seguimos buscando el sabor perfecto.
        </p>

        <div className="story-milestones">
          {milestones.map((m, i) => (
            <div className="story-milestone reveal-up" key={m.year} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="story-year" style={{ background: ["var(--yellow)", "var(--purple)", "var(--red)", "var(--orange)"][i % 4] }}>
                {m.year}
              </div>
              <p className="story-milestone-text">{m.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="story-visual reveal-scale">
        <div className="story-illustration float-anim">
          <Imagen src="/assets/galaxy-bite.png" alt="Cozizina, nuestra historia" />
        </div>
        <div className="story-sticker story-sticker-1 float-anim-delay-2">
          <StickerStar color="#F6BE3B" size={64} />
        </div>
        <div className="story-sticker story-sticker-2 float-anim-delay-3">
          <StickerBolt color="#8F57F2" size={56} />
        </div>
        <div className="story-sticker story-sticker-3 float-anim-delay-1">
          <StickerPlanet size={48} />
        </div>
      </div>
    </section>
  );
}