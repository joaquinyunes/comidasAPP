// Réplica en memoria de src/lib/limite-intentos.ts para los tests de rutas.
// El SQL real se prueba contra Postgres en scripts/prueba-local/limite-intentos.mts.
const tabla = new Map<string, { n: number; desde: number }>();

const espera = (desde: number, ventanaMs: number) => Math.max(0, Math.ceil((desde + ventanaMs - Date.now()) / 1000));

export const falso = {
  contarIntento: async (clave: string, ventanaMs: number) => {
    const f = tabla.get(clave);
    if (!f || Date.now() - f.desde > ventanaMs) tabla.set(clave, { n: 1, desde: Date.now() });
    else f.n += 1;
    const g = tabla.get(clave)!;
    return { n: g.n, espera: espera(g.desde, ventanaMs) };
  },
  leerIntentos: async (clave: string, ventanaMs: number) => {
    const f = tabla.get(clave);
    if (!f || Date.now() - f.desde > ventanaMs) return { n: 0, espera: 0 };
    return { n: f.n, espera: espera(f.desde, ventanaMs) };
  },
  limpiarIntentos: async (clave: string) => void tabla.delete(clave),
  vaciar: () => tabla.clear(),
};
