// Encabezado de la carta: título con aurora y los datos de un vistazo.
export default function CartaCabecera({
  sabores,
  sectores,
}: {
  sabores: number;
  sectores: number;
}) {
  const conDatos = sabores > 0;
  return (
    <header className="carta-cabecera">
      <span className="carta-eyebrow">✦ La carta · Observatorio de sabores</span>
      <h1 className="carta-titulo font-display">
        Nuestra <span>galaxia</span> de sabores
      </h1>
      <p className="carta-intro">
        Todo se prepara al momento con ingredientes frescos. Precios en pesos, con impuestos
        incluidos. Scrolleá y recorré la galaxia sector por sector.
      </p>
      {conDatos ? (
        <ul className="carta-datos">
          <li>
            <strong>{sabores}</strong> sabores
          </li>
          <li>
            <strong>{sectores}</strong> sectores
          </li>
          <li>
            <strong>100%</strong> hecho al momento
          </li>
        </ul>
      ) : null}
    </header>
  );
}
