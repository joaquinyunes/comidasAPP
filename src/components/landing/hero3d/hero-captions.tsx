import Link from "next/link";
import { HERO_CAPTIONS } from "./hero-captions-data";

// Carteles de cada producto del viaje y cartel final. El movimiento lo
// maneja use-hero-scroll por data-attributes; acá sólo hay estructura.
export default function HeroCaptions() {
  return (
    <>
      {HERO_CAPTIONS.map((c) => (
        <div
          key={c.id}
          className={`hero3d-caption hero3d-caption-${c.side}`}
          data-caption={c.id}
        >
          <span className="hero3d-caption-tag">{c.tag}</span>
          <h2 className="hero3d-caption-title">{c.title}</h2>
          <p className="hero3d-caption-text">{c.text}</p>
        </div>
      ))}

      <div className="hero3d-finale" data-finale>
        <span className="hero3d-caption-tag">Misión cumplida</span>
        <h2 className="hero3d-finale-title">Aterrizá en la carta</h2>
        <p className="hero3d-caption-text">
          Pedí para retirar, delivery o en el local. Llega calentito.
        </p>
        <div className="hero3d-finale-cta">
          <Link href="/ordenar" className="pop-btn pop-btn-red">
            Ordenar ahora
          </Link>
          <Link href="/menu" className="pop-btn pop-btn-yellow">
            Ver la carta
          </Link>
        </div>
      </div>
    </>
  );
}
