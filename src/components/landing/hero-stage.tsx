import { Imagen } from "./Imagen";
import HeroSeal from "./hero-seal";

// Escenario del hero: un planeta con órbita sobre el que se apoyan las dos
// mascotas. Todo es una sola composición (no dos imágenes sueltas).
export default function HeroStage() {
  return (
    <div className="hero-stage">
      <div className="hero-planet" aria-hidden="true" />
      <div className="hero-orbit" aria-hidden="true">
        <span className="hero-moon" />
      </div>

      <div className="hero-pic hero-pic-main parallax-target">
        <Imagen
          src="/assets/hero-galaxy-bite.png"
          alt="Shiba astronauta con la Galaxy Bite, hamburguesa cósmica de Cozizina"
          priority
        />
      </div>
      <div className="hero-pic hero-pic-dog parallax-target">
        <Imagen
          src="/assets/hero-hyperdog.png"
          alt="Gallo astronauta cabalgando el Hyperdog, hot dog cósmico de Cozizina"
          priority
        />
      </div>

      <HeroSeal />
      <span className="hero-spark hero-spark-a" aria-hidden="true">✦</span>
      <span className="hero-spark hero-spark-b" aria-hidden="true">✦</span>
    </div>
  );
}
