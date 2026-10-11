// Paleta "planetaria" de cada categoría de la carta. Pura: sólo decide
// colores y nombre de sector a partir del nombre de la categoría.

export interface TemaCategoria {
  planeta: string;
  color1: string;
  color2: string;
}

const POR_PALABRA: ReadonlyArray<readonly [string, TemaCategoria]> = [
  ["pizza", { planeta: "Magma", color1: "#ffb347", color2: "#ff2e4d" }],
  ["empanad", { planeta: "Plasma", color1: "#ff8ae2", color2: "#b620e0" }],
  ["pasta", { planeta: "Pulsar", color1: "#c8ff5c", color2: "#0fb5a6" }],
  ["postre", { planeta: "Nebulosa", color1: "#f5b8ff", color2: "#6d3bff" }],
  ["bebida", { planeta: "Cuántica", color1: "#7df9ff", color2: "#2f5bff" }],
  ["cerveza", { planeta: "Ámbar", color1: "#ffe066", color2: "#f08a00" }],
];

// Para categorías que no matchean ninguna palabra (ensaladas, combos, etc.).
const RESPALDO: readonly TemaCategoria[] = [
  { planeta: "Aurora", color1: "#5eead4", color2: "#8b5cf6" },
  { planeta: "Cometa", color1: "#fda4af", color2: "#f59e0b" },
  { planeta: "Eclipse", color1: "#a5b4fc", color2: "#ec4899" },
  { planeta: "Quásar", color1: "#fde68a", color2: "#14b8a6" },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function temaDeCategoria(nombre: string, indice: number): TemaCategoria {
  const limpio = normalizar(nombre);
  const hallado = POR_PALABRA.find(([palabra]) => limpio.includes(palabra));
  if (hallado) return hallado[1];
  const i = ((indice % RESPALDO.length) + RESPALDO.length) % RESPALDO.length;
  return RESPALDO[i];
}
