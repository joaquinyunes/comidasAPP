import Link from "next/link";

// Columna de texto del hero: titular, bajada y llamados a la acción.
// El titular es el único <h1> de la landing.
export default function HeroCopy() {
  return (
    <div className="hero-copy">
      <p className="hero-eyebrow">Comida al estilo cósmico · Buenos Aires</p>
      <h1 className="hero-heading">
        <span className="hero-title">Antojos</span>
        <span className="hero-title hero-title-accent">de otro</span>
        <span className="hero-title">planeta</span>
      </h1>
      <p className="hero-desc">
        Pizzas, empanadas y hamburguesas con ingredientes frescos y sabores
        que explotan en tu paladar.
      </p>
      <div className="hero-cta">
        <Link href="/ordenar" className="pop-btn pop-btn-red">
          Ordenar ahora
        </Link>
        <Link href="/menu" className="pop-btn pop-btn-yellow">
          Ver la carta
        </Link>
      </div>
    </div>
  );
}
