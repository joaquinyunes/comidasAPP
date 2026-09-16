"use client";

import Link from "next/link";
import { Sticker } from "./ui";
import { Imagen } from "./Imagen";
import { StickerBurst, StickerStar, StickerArrow } from "./illustrations";

export default function Specials() {
  return (
    <section className="specials-section" id="specials">
      <div className="specials-banner">
        <div className="specials-sticker specials-sticker-1 float-anim">
          <StickerBurst color="#F6BE3B" size={80} />
        </div>
        <div className="specials-sticker specials-sticker-2 float-anim-delay-2">
          <StickerStar color="#EF4136" size={56} />
        </div>
        <div className="specials-sticker specials-sticker-3 float-anim-delay-1">
          <StickerArrow color="#8F57F2" size={60} />
        </div>

        <div className="specials-inner">
          <Sticker label="Promo de la semana" color="yellow" className="specials-tag" />
          <h2 className="font-display specials-title">
            Combo <span>Galaxia</span>
          </h2>
          <p className="specials-desc">
            1 Galaxy Bite + 1 Comet Fries + bebida cósmica, por un precio de otro
            planeta. Válido de lunes a jueves.
          </p>
          <Link href="/ordenar" className="pop-btn specials-cta">Quiero el combo</Link>
          <div className="specials-price">
            <span className="specials-price-old">$12.900</span>
            <span className="specials-price-new">$9.900</span>
          </div>
        </div>

        <div className="specials-hero float-anim-delay-1">
          <Imagen src="/assets/specials-combo-galaxia.png" alt="Combo Galaxia: burger, papas y bebida" />
        </div>
      </div>
    </section>
  );
}