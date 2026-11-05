// Generación de secretos y validaciones del alta de un cliente nuevo (V4).
// Funciones puras: lo que se genera acá nunca se imprime junto a otros datos.

import { randomBytes, randomInt } from "node:crypto";

export function generarSecreto(bytes = 48): string {
  return randomBytes(bytes).toString("base64url");
}

const MIN = "abcdefghijkmnopqrstuvwxyz";
const MAY = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUM = "23456789";
const TODOS = MIN + MAY + NUM;

// Clave inicial del administrador: 20 caracteres, sin los que se confunden (l, 1, O, 0, I).
export function generarClaveAdmin(): string {
  const pick = (set: string) => set[randomInt(set.length)];
  const letras = [pick(MIN), pick(MAY), pick(NUM)];
  while (letras.length < 20) letras.push(pick(TODOS));
  for (let i = letras.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [letras[i], letras[j]] = [letras[j], letras[i]];
  }
  return letras.join("");
}

// Slug del restaurante: minúsculas, números y guiones; 3 a 40 caracteres.
export function slugValido(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/.test(slug);
}

export function hostDe(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
