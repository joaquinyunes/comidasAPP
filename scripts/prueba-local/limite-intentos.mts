// Prueba contra Postgres REAL del SQL de los contadores (src/lib/limite-intentos.ts, migración 0007):
// conteo atómico bajo concurrencia, ventana que se reinicia y limpieza.
//
//   $env:EMBEDDED_PG_DIR="<carpeta con embedded-postgres>"; npx tsx scripts/prueba-local/limite-intentos.mts
//
// Crea un clúster temporal en 127.0.0.1:54330 y lo borra al final. No toca ninguna base real.

import { rmSync } from "node:fs";
import { carpetaTemporal, cargarEmbeddedPg, correr, ignorarCierreDeConexiones, urlBase } from "./ayudas.mts";

ignorarCierreDeConexiones();

const PG = 54330;
const url = urlBase(PG);
const resultados: string[] = [];
const ok = (cond: boolean, msg: string) => {
  resultados.push(`${cond ? "✔" : "✖"} ${msg}`);
  if (!cond) throw new Error("Falló la verificación: " + msg);
};

const datos = carpetaTemporal("cozizina-pg-intentos-");
const EmbeddedPostgres = await cargarEmbeddedPg();
const pg = new EmbeddedPostgres({ databaseDir: datos, user: "postgres", password: "prueba", port: PG, persistent: true });
let codigo = 0;

try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("cozizina");
  correr("npx", ["prisma", "migrate", "deploy"], { DATABASE_URL: url });

  process.env.DATABASE_URL = url;
  const { contarIntento, leerIntentos, limpiarIntentos } = await import("../../src/lib/limite-intentos");
  const { estaBloqueado, registrarFallo, limpiarFallos } = await import("../../src/lib/auth/bloqueo-login");
  const { prisma } = await import("../../src/lib/prisma");

  const VENTANA = 10 * 60_000;
  ok((await leerIntentos("x", VENTANA)).n === 0, "sin intentos previos: n = 0");

  // 50 intentos simultáneos desde "instancias" distintas: ninguno se pierde.
  await Promise.all(Array.from({ length: 50 }, () => contarIntento("conc", VENTANA)));
  ok((await leerIntentos("conc", VENTANA)).n === 50, "50 intentos simultáneos cuentan exactamente 50 (conteo atómico)");

  const e = await contarIntento("conc", VENTANA);
  ok(e.n === 51 && e.espera > 0 && e.espera <= 600, "el siguiente es el 51 y informa los segundos que faltan (≤ 600)");

  // Ventana vencida: el contador arranca de cero.
  await contarIntento("vieja", VENTANA);
  await prisma.$executeRaw`UPDATE intentos_fallidos SET desde = now() - interval '11 minutes' WHERE clave = 'vieja'`;
  ok((await leerIntentos("vieja", VENTANA)).n === 0, "una ventana vencida se lee como 0");
  ok((await contarIntento("vieja", VENTANA)).n === 1, "el primer intento tras vencer la ventana vuelve a 1");

  // Bloqueo de login y de 2FA, separados.
  for (let i = 0; i < 5; i++) await registrarFallo("dueno@x.com");
  const espera = await estaBloqueado("dueno@x.com");
  ok(espera > 0 && espera <= 900, `5 fallos bloquean el login (${espera} s de espera, ≤ 900)`);
  ok((await estaBloqueado("dueno@x.com", "2fa")) === 0, "el contador del 2FA es aparte del de login");
  await limpiarFallos("dueno@x.com");
  ok((await estaBloqueado("dueno@x.com")) === 0, "un login correcto limpia los fallos");

  await limpiarIntentos("conc");
  ok((await leerIntentos("conc", VENTANA)).n === 0, "limpiar borra el contador");

  await prisma.$disconnect();
} catch (e) {
  codigo = 1;
  console.error(String(e));
} finally {
  console.log(resultados.join("\n"));
  await pg.stop().catch(() => {});
  for (let i = 0; i < 5; i++) {
    try {
      rmSync(datos, { recursive: true, force: true });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.log(codigo === 0 ? `\n${resultados.length} verificaciones, todas bien.` : "\nFALLÓ.");
  process.exit(codigo);
}
