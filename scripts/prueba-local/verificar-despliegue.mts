// Prueba de scripts/verificar-despliegue.mjs contra Postgres REAL (solo lectura):
// base sin _prisma_migrations (armada con db push) → error; con migraciones al día → ok;
// con una migración borrada del registro → la nombra. Y que no escribe nada en la base.
//
//   $env:EMBEDDED_PG_DIR="<carpeta con embedded-postgres>"; npx tsx scripts/prueba-local/verificar-despliegue.mts
//
// Clúster temporal en 127.0.0.1:54331, se borra al final. No toca ninguna base real.

import { rmSync, readdirSync } from "node:fs";
import { carpetaTemporal, cargarEmbeddedPg, correr, ignorarCierreDeConexiones, urlBase } from "./ayudas.mts";

ignorarCierreDeConexiones();

const PG = 54331;
const url = urlBase(PG);
const resultados: string[] = [];
const ok = (cond: boolean, msg: string) => {
  resultados.push(`${cond ? "✔" : "✖"} ${msg}`);
  if (!cond) throw new Error("Falló la verificación: " + msg);
};
const ENV = {
  DATABASE_URL: url,
  JWT_SECRET: "Zq8vK2mXp9LrT4wYc7NbH1sDf6GjA3eU5oIkRtQy0VxW",
  MERCADOPAGO_WEBHOOK_SECRET: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
  QR_LOCAL_CODIGO: "k9Tq2LmX7",
  MERCADOPAGO_ACCESS_TOKEN: "APP_USR-123456-abcdef",
};
const verificar = () => correr("node", ["scripts/verificar-despliegue.mjs"], ENV, { sinFallar: true });

const datos = carpetaTemporal("cozizina-pg-verif-");
const EmbeddedPostgres = await cargarEmbeddedPg();
const pg = new EmbeddedPostgres({ databaseDir: datos, user: "postgres", password: "prueba", port: PG, persistent: true });
let codigo = 0;

try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("cozizina");
  const { Client } = await import("pg");
  const bd = new Client({ connectionString: url });
  bd.on("error", () => {});
  await bd.connect();

  let r = verificar();
  ok(r.codigo === 1 && /_prisma_migrations/.test(r.salida) && /db push/.test(r.salida), "base sin _prisma_migrations (db push): NO desplegar y explica el baseline");

  correr("npx", ["prisma", "migrate", "deploy"], { DATABASE_URL: url });
  const n = readdirSync("prisma/migrations", { withFileTypes: true }).filter((d) => d.isDirectory()).length;
  r = verificar();
  ok(r.codigo === 0 && r.salida.includes(`(${n} en el repo)`) && /Listo para desplegar/.test(r.salida), `con las ${n} migraciones aplicadas: listo para desplegar`);
  ok(!r.salida.includes("prueba@") && !r.salida.includes(ENV.JWT_SECRET), "la salida no muestra contraseñas ni secretos");

  await bd.query("DELETE FROM _prisma_migrations WHERE migration_name LIKE '0007%'");
  r = verificar();
  ok(r.codigo === 1 && /sin aplicar: 0007_intentos_fallidos/.test(r.salida), "con la 0007 sin registrar: NO desplegar y la nombra");

  const filas = Number((await bd.query("SELECT count(*)::int n FROM _prisma_migrations")).rows[0].n);
  ok(filas === n - 1, "el script no escribió nada en la base (solo lectura)");
  await bd.end().catch(() => {});
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
