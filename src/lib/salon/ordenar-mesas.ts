// Orden natural del salón: por sector y, dentro de cada uno, por número
// de mesa entendido como número ("2" antes que "10"), no como texto.

interface ConOrden {
  numero: string;
  sector: string;
  ordenSector: number;
}

export function ordenarMesas<T extends ConOrden>(mesas: T[]): T[] {
  return [...mesas].sort((a, b) => {
    if (a.ordenSector !== b.ordenSector) return a.ordenSector - b.ordenSector;
    if (a.sector !== b.sector) return a.sector.localeCompare(b.sector, "es");
    return a.numero.localeCompare(b.numero, "es", { numeric: true });
  });
}
