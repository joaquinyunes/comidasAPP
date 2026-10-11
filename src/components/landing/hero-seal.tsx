// Sello circular del hero (decorativo: el horario real vive en la sección
// de ubicaciones y en la cinta de abajo).
export default function HeroSeal() {
  return (
    <div className="hero-seal" aria-hidden="true">
      <span>Abierto</span>
      <span>hasta</span>
      <strong>medianoche</strong>
    </div>
  );
}
