// Cada puesto de cocina (parrilla, barra, postres…) ve solo lo suyo.

interface ItemConEstacion {
  estacion: string | null;
}

interface ComandaConItems<I extends ItemConEstacion> {
  items: I[];
}

export const SIN_ESTACION = "Sin estación";

export function nombreEstacion(estacion: string | null): string {
  return estacion?.trim() || SIN_ESTACION;
}

export function estacionesDe<I extends ItemConEstacion, C extends ComandaConItems<I>>(
  comandas: C[]
): string[] {
  const set = new Set<string>();
  for (const c of comandas) for (const i of c.items) set.add(nombreEstacion(i.estacion));
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

// Deja en cada comanda solo los ítems de la estación y descarta las vacías.
export function filtrarPorEstacion<I extends ItemConEstacion, C extends ComandaConItems<I>>(
  comandas: C[],
  estacion: string | null
): C[] {
  if (!estacion) return comandas;
  return comandas
    .map((c) => ({ ...c, items: c.items.filter((i) => nombreEstacion(i.estacion) === estacion) }))
    .filter((c) => c.items.length > 0);
}
