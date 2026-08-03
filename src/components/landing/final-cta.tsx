"use client";

export default function FinalCta() {
  return (
    <section
      id="contact"
      className="final-cta"
      style={
        {
          "--cta-img":
            "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80')",
        } as React.CSSProperties
      }
    >
      <div className="final-cta-content reveal">
        <span className="eyebrow">Reserva tu mesa</span>
        <h2>
          Ven por la{" "}
          <span className="font-accent" style={{ color: "var(--gold)" }}>
            pizza
          </span>
        </h2>
        <p>
          Reserva tu experiencia en Just Pizza. Atencion personalizada, horno de
          leña encendido todo el dia, y los sabores que van a cambiar tu forma de
          comer pizza.
        </p>
        <a href="tel:+525555555555" className="cta glow-pulse">
          Reservar mesa
        </a>
      </div>
    </section>
  );
}
