"use client";

export default function Footer() {
  return (
    <footer>
      <div className="foot-links">
        <a href="#menu">Carta</a>
        <a href="#stats">Nosotros</a>
        <a href="#regions">Sucursales</a>
        <a href="tel:+525555555555">Reservas</a>
      </div>
      <div className="foot-wordmark">
        <div className="echo">
          <span className="echo-back" aria-hidden="true">
            JUST PIZZA
          </span>
          <h2 className="font-display">
            JUST <span>PIZZA</span>
          </h2>
        </div>
      </div>
      <div className="foot-fine">
        &copy; {new Date().getFullYear()} Just Pizza. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
