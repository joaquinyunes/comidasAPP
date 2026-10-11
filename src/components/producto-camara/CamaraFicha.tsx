import Link from "next/link";
import type { ProductoCamara } from "./tipos";
import type { TamanoResuelto } from "./tamano-estimado";
import { ETIQUETA_MEDIDA } from "./tamano-estimado";
import { traeDe } from "./trae";

const PICANTE = ["", "🌶", "🌶🌶", "🌶🌶🌶"];

function precioTexto(precio: number): string {
  return `$${Math.round(precio).toLocaleString("es-AR")}`;
}

// Panel inferior: medida, peso y todo lo que trae el plato.
export default function CamaraFicha({
  producto,
  tamano,
}: {
  producto: ProductoCamara;
  tamano: TamanoResuelto;
}) {
  const trae = traeDe(producto);
  const alergenos = producto.alergenos ?? [];
  const picante = Math.min(producto.nivelPicante ?? 0, 3);

  return (
    <section className="cam-ficha" aria-label={`Detalle de ${producto.nombre}`}>
      <div className="cam-ficha-cab">
        <h3 className="cam-ficha-nombre">{producto.nombre}</h3>
        {producto.precio != null && <span className="cam-ficha-precio">{precioTexto(producto.precio)}</span>}
      </div>

      <ul className="cam-datos">
        <li>
          <span className="cam-dato-clave">{ETIQUETA_MEDIDA[tamano.tipo]}</span>
          <strong>
            {tamano.cm} cm{tamano.estimado ? " (aprox.)" : ""}
          </strong>
        </li>
        {producto.pesoGr ? (
          <li>
            <span className="cam-dato-clave">Peso</span>
            <strong>{producto.pesoGr} g</strong>
          </li>
        ) : null}
        {producto.calorias ? (
          <li>
            <span className="cam-dato-clave">Energía</span>
            <strong>{producto.calorias} kcal</strong>
          </li>
        ) : null}
        {picante > 0 && (
          <li>
            <span className="cam-dato-clave">Picante</span>
            <strong>{PICANTE[picante]}</strong>
          </li>
        )}
      </ul>

      {trae.length > 0 && (
        <div className="cam-trae">
          <h4 className="cam-trae-titulo">Trae</h4>
          <ul className="cam-chips">
            {trae.map((t) => (
              <li key={t} className="cam-chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {alergenos.length > 0 && (
        <p className="cam-alergenos">
          <strong>Alérgenos:</strong> {alergenos.join(", ")}
        </p>
      )}

      <Link href="/ordenar" className="pop-btn pop-btn-red cam-ordenar">
        Ordenar ahora
      </Link>
    </section>
  );
}
