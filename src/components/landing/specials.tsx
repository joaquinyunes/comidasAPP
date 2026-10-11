"use client";

import { useRef } from "react";
import Link from "next/link";
import { Sticker } from "./ui";
import { StickerBurst, StickerStar, StickerArrow } from "./illustrations";
import SpecialsCombo from "./specials-combo";
import SpecialsMarquee from "./specials-marquee";
import { useComboEntrance } from "./animations/use-combo-entrance";
import { usePointerParallax } from "./animations/use-pointer-parallax";

// Promo de la semana: banner violeta con el combo "armándose" al entrar
// (use-combo-entrance), parallax con el puntero (use-pointer-parallax) y una
// cinta continua al pie. El precio baja contando hasta el de la promo.
export default function Specials() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useComboEntrance(bannerRef);
  usePointerParallax(bannerRef, 30);

  return (
    <section className="specials-section" id="specials">
      <div ref={bannerRef} className="specials-banner">
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
          <div data-copia>
            <Sticker label="Promo de la semana" color="yellow" className="specials-tag" />
          </div>
          <h2 data-copia className="font-display specials-title">
            Combo <span>Galaxia</span>
          </h2>
          <p data-copia className="specials-desc">
            1 Galaxy Bite + 1 Comet Fries + bebida cósmica, por un precio de otro
            planeta. Válido de lunes a jueves.
          </p>
          <div data-copia>
            <Link href="/ordenar" className="pop-btn specials-cta">
              Quiero el combo
            </Link>
          </div>
          <div data-copia className="specials-price">
            <span className="specials-price-old">$12.900</span>
            <span data-precio-nuevo className="specials-price-new">
              $9.900
            </span>
          </div>
        </div>

        <SpecialsCombo />
        <SpecialsMarquee />
      </div>
    </section>
  );
}
