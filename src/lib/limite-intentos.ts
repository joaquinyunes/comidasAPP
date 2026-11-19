// ============================================================
// Contadores de intentos en BASE DE DATOS (tabla intentos_fallidos, migración 0007).
// Antes vivían en memoria del proceso: en Vercel cada instancia llevaba el suyo y el tope real
// era N x instancias. Acá el conteo es atómico (un solo INSERT … ON CONFLICT) y vale para todas.
// La ventana corre desde el PRIMER intento; pasada la ventana el contador arranca de cero.
// ============================================================

import { prisma } from "@/lib/prisma";

export interface EstadoIntentos {
  n: number; // intentos dentro de la ventana
  espera: number; // segundos que faltan para que la ventana se reinicie
}

// Cuenta un intento y devuelve el total dentro de la ventana.
export async function contarIntento(clave: string, ventanaMs: number): Promise<EstadoIntentos> {
  const seg = ventanaMs / 1000;
  const filas = await prisma.$queryRaw<EstadoIntentos[]>`
    INSERT INTO intentos_fallidos (clave, n, desde) VALUES (${clave}, 1, now())
    ON CONFLICT (clave) DO UPDATE SET
      n = CASE WHEN intentos_fallidos.desde < now() - make_interval(secs => ${seg}::double precision)
               THEN 1 ELSE intentos_fallidos.n + 1 END,
      desde = CASE WHEN intentos_fallidos.desde < now() - make_interval(secs => ${seg}::double precision)
                   THEN now() ELSE intentos_fallidos.desde END
    RETURNING n,
      GREATEST(0, CEIL(EXTRACT(EPOCH FROM (desde + make_interval(secs => ${seg}::double precision) - now()))))::int AS espera`;
  return filas[0];
}

// Intentos acumulados sin sumar uno (0 si no hay o la ventana ya venció).
export async function leerIntentos(clave: string, ventanaMs: number): Promise<EstadoIntentos> {
  const seg = ventanaMs / 1000;
  const filas = await prisma.$queryRaw<EstadoIntentos[]>`
    SELECT n,
      GREATEST(0, CEIL(EXTRACT(EPOCH FROM (desde + make_interval(secs => ${seg}::double precision) - now()))))::int AS espera
    FROM intentos_fallidos
    WHERE clave = ${clave} AND desde >= now() - make_interval(secs => ${seg}::double precision)`;
  return filas[0] ?? { n: 0, espera: 0 };
}

export async function limpiarIntentos(clave: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM intentos_fallidos WHERE clave = ${clave}`;
}
