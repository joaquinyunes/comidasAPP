import type { ProductoCamara } from "./tipos";

const MAX = 8;

// "Lo que trae" el plato: lista explícita si existe; si no, se deduce de la
// descripción cortando por comas y "y" (ej. "salsa, muzzarella y aceite").
export function traeDe(p: Pick<ProductoCamara, "incluye" | "descripcion">): string[] {
  const explicito = (p.incluye ?? []).map((s) => s.trim()).filter(Boolean);
  if (explicito.length) return explicito.slice(0, MAX);

  const desc = (p.descripcion ?? "").trim();
  if (!desc) return [];

  return desc
    .replace(/\.+$/, "")
    .split(/,|;|\sy\s|\se\s/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length <= 48)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .slice(0, MAX);
}
