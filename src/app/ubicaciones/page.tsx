import Link from "next/link";
import SiteChrome from "@/components/landing/site-chrome";
import { LOCALES } from "@/config/locales";

export const metadata = { title: "Ubicaciones" };


export default function UbicacionesPage() {
  return (
    <SiteChrome
      eyebrow="Ubicaciones"
      title={<>Dónde <span>encontrarnos</span></>}
      intro="Dos locales en Buenos Aires. Reparto propio en la zona de cada sucursal."
    >
      <div className="loc-grid">
        {LOCALES.map((l) => (
          <div className="loc-card" key={l.id}>
            <h3>{l.nombre}</h3>
            <dl>
              <dt>Dirección</dt>
              <dd>{l.direccion}</dd>
              <dt>Teléfono</dt>
              <dd>{l.telefono}</dd>
              <dt>Horario</dt>
              <dd>{l.horario}</dd>
            </dl>
            <a
              className="pop-btn pop-btn-yellow"
              style={{ marginTop: 12 }}
              href={`https://www.google.com/maps/search/${encodeURIComponent(l.direccion)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en el mapa
            </a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 44 }}>
        <Link href="/reservar" className="pop-btn pop-btn-red">Reservar una mesa</Link>
      </div>
    </SiteChrome>
  );
}
