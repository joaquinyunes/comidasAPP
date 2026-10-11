// Los clásicos del slider "Elegí tu misión". Imágenes: recortes con fondo
// transparente (public/assets/3d), para que floten sobre el planeta de color.

export interface GalaxySlide {
  name: string;
  word: string;
  tagline: string;
  img: string;
  color: string;
  ink: string;
}

export const GALAXY_SLIDES: readonly GalaxySlide[] = [
  {
    name: "Galaxy Bite",
    word: "GALAXY",
    tagline: "La burger violeta con papas, bebida y un copiloto muy peludo.",
    img: "/assets/3d/galaxy-bite.webp",
    color: "var(--yellow)",
    ink: "var(--black)",
  },
  {
    name: "Hyperdog",
    word: "HYPERDOG",
    tagline: "Pancho XL con papas y helado: velocidad luz en tu mesa.",
    img: "/assets/3d/hyperdog.webp",
    color: "var(--purple-light)",
    ink: "var(--white)",
  },
  {
    name: "Pizzanaut",
    word: "PIZZANAUT",
    tagline: "Porción gigante, papas y shake para despegar con estilo.",
    img: "/assets/3d/pizzanaut.webp",
    color: "var(--red)",
    ink: "var(--white)",
  },
];
