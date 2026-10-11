const TEXTOS = ["Combo Galaxia", "Galaxy Bite", "Comet Fries", "Bebida cósmica", "Lunes a jueves"];

// Cinta que corre sin parar al pie del banner: duplicamos el contenido y se
// desplaza la mitad, así el bucle no tiene salto.
export default function SpecialsMarquee() {
  const tira = TEXTOS.map((t) => (
    <span key={t} className="especiales-cinta-item">
      {t} <b aria-hidden="true">✦</b>
    </span>
  ));
  return (
    <div className="especiales-cinta" aria-hidden="true">
      <div className="especiales-cinta-pista">
        <div className="especiales-cinta-grupo">{tira}</div>
        <div className="especiales-cinta-grupo">{tira}</div>
      </div>
    </div>
  );
}
