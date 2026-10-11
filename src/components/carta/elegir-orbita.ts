import type { CategoriaLanding, ProductoLanding } from "@/lib/landing-data";

// Elige los platos que giran en la órbita: primero los destacados, después
// uno por categoría para que haya variedad. Sólo entran los que tienen foto.
export function elegirOrbita(carta: CategoriaLanding[], max = 8): ProductoLanding[] {
  const conFoto = carta.map((c) => c.productos.filter((p) => !!p.imagenUrl));
  const elegidos: ProductoLanding[] = [];
  const usados = new Set<string>();

  const sumar = (p: ProductoLanding | undefined) => {
    if (!p || usados.has(p.id) || elegidos.length >= max) return;
    usados.add(p.id);
    elegidos.push(p);
  };

  conFoto.flat().filter((p) => p.destacado).forEach(sumar);

  const hondo = Math.max(0, ...conFoto.map((l) => l.length));
  for (let nivel = 0; nivel < hondo && elegidos.length < max; nivel++) {
    conFoto.forEach((lista) => sumar(lista[nivel]));
  }
  return elegidos;
}
