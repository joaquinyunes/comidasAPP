import Link from "next/link";
import SiteChrome from "@/components/landing/site-chrome";

export const metadata = { title: "Nosotros" };

const HITOS = [
  { año: "2019", txt: "Nace Cozizina en un food truck en Palermo. Tres recetas y muchas ganas." },
  { año: "2021", txt: "Abrimos el primer local fijo sobre Av. Corrientes." },
  { año: "2023", txt: "Sumamos la sucursal de Villa Crespo y arrancamos con reparto propio." },
  { año: "2025", txt: "Más de 200 mil pedidos servidos. Misma cocina, mismo sabor." },
];

export default function NosotrosPage() {
  return (
    <SiteChrome
      eyebrow="Nuestra historia"
      title={<>Comida al estilo <span>cósmico</span></>}
      intro="Cozizina nació de una idea simple: comida rápida hecha en serio, con ingredientes frescos y sin vueltas. Dos locales en Buenos Aires."
    >
      <div className="prose-pop">
        <p>
          Empezamos con una parrilla, un food truck y la obsesión por el punto
          exacto de la masa. Hoy tenemos dos locales en Buenos Aires, cocina
          propia y reparto en la zona, pero seguimos armando cada plato al
          momento del pedido.
        </p>
        <h2>Lo que no cambia</h2>
        <ul>
          <li>Pan horneado cada mañana y carne Angus fresca, nunca congelada.</li>
          <li>Salsas de receta propia, hechas en casa.</li>
          <li>Nada sale de la cocina si no nos lo comeríamos nosotros.</li>
        </ul>
      </div>

      <div className="loc-grid" style={{ marginTop: 40 }}>
        {HITOS.map((h) => (
          <div className="loc-card" key={h.año}>
            <h3>{h.año}</h3>
            <p style={{ opacity: 0.78, lineHeight: 1.55 }}>{h.txt}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 44, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Link href="/menu" className="pop-btn pop-btn-red">Ver la carta</Link>
        <Link href="/ubicaciones" className="pop-btn pop-btn-yellow">Dónde estamos</Link>
      </div>
    </SiteChrome>
  );
}
