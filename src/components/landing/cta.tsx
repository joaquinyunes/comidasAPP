"use client";

import Link from "next/link";
import { Sticker } from "./ui";
import { StickerStar, StickerBolt, StickerPlanet, StickerBurst, StickerDot } from "./illustrations";

export default function FinalCTA() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta-bg">
        <div className="cta-sticker cta-sticker-1 float-anim"><StickerStar color="#F6BE3B" size={70} /></div>
        <div className="cta-sticker cta-sticker-2 float-anim-delay-1"><StickerBolt color="#F89B28" size={56} /></div>
        <div className="cta-sticker cta-sticker-3 float-anim-delay-2"><StickerPlanet size={64} /></div>
        <div className="cta-sticker cta-sticker-4 float-anim-delay-1"><StickerBurst color="#EF4136" size={50} /></div>
        <div className="cta-sticker cta-sticker-5 float-anim-delay-2"><StickerDot color="#8F57F2" size={32} /></div>
        <div className="cta-sticker cta-sticker-6 float-anim"><StickerStar color="#F6BE3B" size={40} /></div>
      </div>

      <div className="cta-inner">
        <Sticker label="Último destino" color="purple" className="cta-tag" />
        <h2 className="font-display cta-title reveal-up">
          Tu mesa está <span>en órbita</span>
        </h2>
        <p className="cta-desc reveal-up">
          No esperes a que se agoten las estrellas. Reservá, ordená y dejá que
          tus sentidos despeguen hoy mismo.
        </p>
        <div className="cta-actions reveal-up">
          <Link href="/ordenar" className="pop-btn pop-btn-red cta-order">Ordenar ahora</Link>
          <Link href="/reservar" className="pop-btn pop-btn-yellow cta-reserve">Reservar mesa</Link>
        </div>
      </div>
    </section>
  );
}