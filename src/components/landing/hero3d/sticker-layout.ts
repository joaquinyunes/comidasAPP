// Dónde vive cada "sticker" (producto) en el recorrido 3D. Datos puros:
// la escena los consume, los captions los espejan por progreso de scroll.

export interface StickerDef {
  id: string;
  src: string;
  alt: string;
  // Posición en el mundo. `x` ya viene sin escalar por `spread`.
  x: number;
  y: number;
  z: number;
  // Ancho en unidades de mundo (el alto sale del aspect de la textura).
  size: number;
  tilt: number; // rotación Z base, en radianes
  floatPhase: number;
}

export interface StickerLayout {
  hero: StickerDef[];
  products: StickerDef[];
}

// `anchorX`: en escritorio el texto va a la izquierda y la escena a la
// derecha; en pantallas angostas la escena se centra (anchorX = 0).
export function stickerLayout(spread: number, anchorX: number, anchorY = 0): StickerLayout {
  const s = spread;
  // En pantallas angostas los productos se achican para entrar en cuadro.
  const fit = Math.max(0.7, s);
  return {
    hero: [
      {
        id: "galaxy-bite",
        src: "/assets/3d/hero-galaxy-bite.webp",
        alt: "Shiba astronauta con la Galaxy Bite",
        x: anchorX + 0.35 * s,
        y: 0.55 + anchorY,
        z: 1.2,
        size: 4.9 * Math.max(0.62, s),
        tilt: -0.08,
        floatPhase: 0,
      },
      {
        id: "hyperdog",
        src: "/assets/3d/hero-hyperdog.webp",
        alt: "Gallo astronauta con el Hyperdog",
        x: anchorX - 1.7 * s,
        y: -1.55 + anchorY,
        z: 3.4,
        size: 3.1 * Math.max(0.62, s),
        tilt: 0.1,
        floatPhase: 1.6,
      },
    ],
    products: [
      { id: "pizzanaut", src: "/assets/3d/pizzanaut.webp", alt: "Pizzanaut", x: 2.5 * s, y: 0.3, z: -14, size: 4.2 * fit, tilt: 0.12, floatPhase: 0.4 },
      { id: "meteor-empanada", src: "/assets/3d/meteor-empanada.webp", alt: "Meteor Empanada", x: -2.6 * s, y: -0.2, z: -21, size: 4.0 * fit, tilt: -0.14, floatPhase: 1.1 },
      { id: "comet-fries", src: "/assets/3d/comet-fries.webp", alt: "Comet Fries", x: 2.5 * s, y: 0.2, z: -28, size: 4.0 * fit, tilt: 0.1, floatPhase: 2.3 },
      { id: "nebula-soda", src: "/assets/3d/nebula-soda.webp", alt: "Nebula Soda", x: -2.4 * s, y: 0.1, z: -35, size: 3.8 * fit, tilt: -0.1, floatPhase: 3.0 },
    ],
  };
}

// Ancla horizontal y factor de apertura según la proporción del viewport.
// En vertical el texto ocupa la parte alta: la escena baja (anchorY < 0).
export function layoutForAspect(aspect: number): { spread: number; anchorX: number; anchorY: number } {
  const spread = Math.min(1, Math.max(0.45, aspect / 1.7));
  const wide = aspect > 1.15;
  return { spread, anchorX: wide ? 2.5 : 0, anchorY: wide ? 0 : -2.3 };
}
