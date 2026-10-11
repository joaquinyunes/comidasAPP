// Contenido de la historia de Cozizina, en el orden en que se cuenta al
// scrollear. Cada capítulo = una lámina (imagen) + un texto + un año.

export interface Capitulo {
  id: string;
  anio: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  imagen: string;
  alt: string;
  color1: string;
  color2: string;
}

export const CAPITULOS: readonly Capitulo[] = [
  {
    id: "food-truck",
    anio: "2019",
    etiqueta: "Capítulo 1 · El despegue",
    titulo: "Un food truck y tres recetas",
    texto:
      "Nace Cozizina en un food truck en Palermo. Una parrilla, tres recetas, la obsesión por el punto exacto de la masa y muchas ganas.",
    imagen: "/assets/historia/foodtruck.webp",
    alt: "El food truck cósmico donde nació Cozizina",
    color1: "#ffd23f",
    color2: "#ff8a3d",
  },
  {
    id: "primer-local",
    anio: "2021",
    etiqueta: "Capítulo 2 · Base propia",
    titulo: "El primer local, sobre Corrientes",
    texto:
      "Abrimos el primer local fijo sobre Av. Corrientes. Cocina propia, pan horneado cada mañana y cada plato armado al momento del pedido.",
    imagen: "/assets/historia/horno.webp",
    alt: "El horno cósmico de la cocina de Cozizina",
    color1: "#ffb347",
    color2: "#ff2e4d",
  },
  {
    id: "reparto",
    anio: "2023",
    etiqueta: "Capítulo 3 · Órbita ampliada",
    titulo: "Dos locales y reparto propio",
    texto:
      "Sumamos la sucursal de Villa Crespo y arrancamos con reparto propio: el mismo sabor, ahora hasta tu puerta.",
    imagen: "/assets/historia/reparto.webp",
    alt: "La moto de reparto propio de Cozizina cruzando la galaxia",
    color1: "#7df9ff",
    color2: "#2f5bff",
  },
  {
    id: "hoy",
    anio: "2025",
    etiqueta: "Capítulo 4 · Hoy",
    titulo: "Más de 200 mil pedidos",
    texto:
      "Más de 200 mil pedidos servidos. Misma cocina, mismo sabor, y la misma regla de siempre: nada sale si no nos lo comeríamos nosotros.",
    imagen: "/assets/historia/combo.webp",
    alt: "El combo galaxia de Cozizina: hamburguesa, papas y bebida",
    color1: "#f5b8ff",
    color2: "#6d3bff",
  },
];

export interface Principio {
  id: string;
  titulo: string;
  texto: string;
  imagen: string;
  alt: string;
  color1: string;
  color2: string;
}

export const PRINCIPIOS: readonly Principio[] = [
  {
    id: "fresco",
    titulo: "Pan y carne frescos",
    texto: "Pan horneado cada mañana y carne Angus fresca, nunca congelada.",
    imagen: "/assets/historia/parrilla.webp",
    alt: "La plancha cósmica de Cozizina con hamburguesas",
    color1: "#ffb347",
    color2: "#ff2e4d",
  },
  {
    id: "salsas",
    titulo: "Salsas de la casa",
    texto: "Salsas de receta propia, hechas en casa, con ingredientes de verdad.",
    imagen: "/assets/historia/toppings.webp",
    alt: "Hojas, tomate y cebolla frescos para las salsas y toppings",
    color1: "#c8ff5c",
    color2: "#0fb5a6",
  },
  {
    id: "estandar",
    titulo: "Nuestra vara",
    texto: "Nada sale de la cocina si no nos lo comeríamos nosotros.",
    imagen: "/assets/historia/equipo.webp",
    alt: "Dos cocineros astronautas chocando los cinco en la cocina",
    color1: "#f5b8ff",
    color2: "#6d3bff",
  },
];
