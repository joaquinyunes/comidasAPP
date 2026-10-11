// La API serializa los Decimal de Prisma como string ("6500"); aceptamos ambos.
export function formatearPrecio(valor: number | string | null | undefined): string {
  const n = Number(valor);
  if (valor === null || valor === undefined || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}
