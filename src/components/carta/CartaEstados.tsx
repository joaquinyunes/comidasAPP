import Link from "next/link";

// Estados de la carta que no son la carta: cargando, error y vacía.
export function CartaCargando() {
  return (
    <div className="carta-estado" role="status" aria-live="polite">
      <span className="carta-estado-planeta" aria-hidden="true" />
      <p>Escaneando la galaxia de sabores…</p>
    </div>
  );
}

export function CartaError() {
  return (
    <div className="carta-estado" role="alert">
      <p>
        No pudimos cargar la carta ahora. Escribinos o{" "}
        <Link href="/ordenar" className="carta-enlace">
          hacé tu pedido acá
        </Link>
        .
      </p>
    </div>
  );
}

export function CartaVacia() {
  return (
    <div className="carta-estado">
      <p>Estamos actualizando la carta. Volvé en un rato.</p>
    </div>
  );
}
