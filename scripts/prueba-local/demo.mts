// V3 — Prueba LOCAL del entorno de demo: Postgres temporal → migraciones → seed de demostración →
// build con DEMO_MODE=1 → app en modo producción: cartel visible, carta con datos de ejemplo, login demo.
// También prueba que el seed se NIEGA contra una base remota que no es de demo.
//
//   $env:EMBEDDED_PG_DIR="<carpeta con embedded-postgres>"; npx tsx scripts/prueba-local/demo.mts
//
// Clúster temporal en 127.0.0.1:54332. No toca ninguna base real. Deja .next con el build DEMO:
// volver a correr `npm run build` después.

import { spawn } from "node:child_process";
import { join } from "node:path";
import { rmSync } from "node:fs";
import { carpetaTemporal, cargarEmbeddedPg, correr, esperarHttp, ignorarCierreDeConexiones, urlBase } from "./ayudas.mts";

ignorarCierreDeConexiones();

const PG = 54332;
const APP = 3191;
const url = urlBase(PG);
const resultados: string[] = [];
const ok = (cond: boolean, msg: string) => {
  resultados.push(`${cond ? "✔" : "✖"} ${msg}`);
  if (!cond) throw new Error("Falló la verificación: " + msg);
};

const datos = carpetaTemporal("cozizina-pg-demo-");
const EmbeddedPostgres = await cargarEmbeddedPg();
const pg = new EmbeddedPostgres({ databaseDir: datos, user: "postgres", password: "prueba", port: PG, persistent: true });
let servidor: ReturnType<typeof spawn> | null = null;
let codigo = 0;

try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("cozizina");
  correr("npx", ["prisma", "migrate", "deploy"], { DATABASE_URL: url });

  // El seed se niega contra una base remota que no es de demo (aunque se confirme el host).
  const remota = correr("npx", ["tsx", "prisma/seed.ts", "--confirmo-base", "db.real.supabase.co"], { DATABASE_URL: "postgresql://u:p@db.real.supabase.co:5432/postgres", NODE_ENV: "development" }, { sinFallar: true });
  ok(remota.codigo !== 0 && /DEMO|--confirmo-base|remota/.test(remota.salida), "el seed se niega contra una base remota que no es de demo");

  const sinConfirmar = correr("npx", ["tsx", "prisma/seed.ts"], { DATABASE_URL: "postgresql://u:p@db.real.supabase.co:5432/postgres", NODE_ENV: "development" }, { sinFallar: true });
  ok(sinConfirmar.codigo !== 0 && /--confirmo-base/.test(sinConfirmar.salida), "y sin --confirmo-base tampoco corre");

  correr("npx", ["tsx", "prisma/seed.ts"], { DATABASE_URL: url, NODE_ENV: "development" });
  ok(true, "el seed de demostración corre contra la base local");

  const entorno = { DATABASE_URL: url, DEMO_MODE: "1", TENANT_SLUG: "pizzaria-demo", JWT_SECRET: "Zq8vK2mXp9LrT4wYc7NbH1sDf6GjA3eU5oIkRtQy0VxW", QR_LOCAL_CODIGO: "k9Tq2LmX7" };
  correr("npm", ["run", "build"], entorno);
  ok(true, "build de producción con DEMO_MODE=1");

  const next = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  servidor = spawn(process.execPath, [next, "start", "-p", String(APP)], { env: { ...process.env, ...entorno, NODE_ENV: "production" }, stdio: "ignore" });
  const base = `http://127.0.0.1:${APP}`;
  await esperarHttp(`${base}/api/salud`);

  const home = await (await fetch(base + "/")).text();
  ok(/DEMO — datos de ejemplo/.test(home), "la portada muestra el cartel «DEMO — datos de ejemplo»");

  const landing = await (await fetch(`${base}/api/publico/landing`)).json();
  const productos = (landing.carta ?? []).flatMap((c: { productos: unknown[] }) => c.productos);
  ok(productos.length > 0, `la carta del demo trae datos de ejemplo (${productos.length} productos)`);

  const login = await fetch(base + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "admin@cozizina.com", password: "admin123" }) });
  ok(login.status === 200, "el usuario demo entra con la clave de demostración");
} catch (e) {
  codigo = 1;
  console.error(String(e));
} finally {
  servidor?.kill();
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
