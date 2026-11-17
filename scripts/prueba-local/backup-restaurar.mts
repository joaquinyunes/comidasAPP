// S10 — Prueba LOCAL de respaldo y restauración (física, en frío), cronometrada:
// base con datos → apagado limpio → .tgz → cifrado AES-256 con gpg → se borra el original →
// descifrar → restaurar en otra carpeta y otro puerto → contar filas y sumar pagos.
//
// Qué NO prueba: `pg_dump`/`pg_restore` (no hay en esta máquina; los usa el workflow de GitHub,
// .github/workflows/backup-db.yml, que sigue sin correr). Esto prueba que la copia cifrada de
// una base real se puede abrir y devuelve exactamente los mismos datos.
//
//   $env:EMBEDDED_PG_DIR="<carpeta con embedded-postgres>"; npx tsx scripts/prueba-local/backup-restaurar.mts

import { existsSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { carpetaTemporal, cargarEmbeddedPg, correr, cronometro, ignorarCierreDeConexiones, urlBase } from "./ayudas.mts";

ignorarCierreDeConexiones();

const P_ORIGEN = 54331;
const P_RESTAURADA = 54332;
const SLUG = "resto-backup";
const envFile = `.env.cliente-${SLUG}`;
const cron = cronometro();
const resultados: string[] = [];
const ok = (cond: boolean, msg: string) => {
  resultados.push(`${cond ? "✔" : "✖"} ${msg}`);
  if (!cond) throw new Error("Falló la verificación: " + msg);
};
const barra = (p: string) => p.replace(/\\/g, "/");

const raiz = carpetaTemporal("cozizina-bk-");
const datosOrigen = join(raiz, "origen");
const datosRestaurados = join(raiz, "restaurado");
const tgz = join(raiz, "copia.tgz");
const cifrado = join(raiz, "copia.tgz.gpg");
const frase = randomBytes(24).toString("base64url");
const EmbeddedPostgres = await cargarEmbeddedPg();
const nuevo = (dir: string, puerto: number) => new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "prueba", port: puerto, persistent: true });

const TABLAS = ["tenants", "usuarios", "roles", "pedidos", "pagos", "audit_log", "pedido_eventos"];
async function huella(url: string) {
  const { Client } = await import("pg");
  const c = new Client({ connectionString: url });
  c.on("error", () => {});
  await c.connect();
  const filas: Record<string, number> = {};
  for (const t of TABLAS) filas[t] = Number((await c.query(`select count(*)::int n from ${t}`)).rows[0].n);
  const suma = String((await c.query("select coalesce(sum(monto),0)::text s from pagos")).rows[0].s);
  const hashes = String((await c.query("select md5(string_agg(password_hash, ',' order by id)) h from usuarios")).rows[0].h);
  await c.end();
  return { filas, suma, hashes };
}

try {
  const urlO = urlBase(P_ORIGEN);
  const origen = nuevo(datosOrigen, P_ORIGEN);

  const antes = await cron.medir("1. Base con datos reales de prueba (migrar + alta + pedidos y pagos)", async () => {
    await origen.initialise();
    await origen.start();
    await origen.createDatabase("cozizina");
    correr("npx", ["prisma", "migrate", "deploy"], { DATABASE_URL: urlO });
    correr("npx", ["tsx", "scripts/nuevo-cliente/index.ts", "env", "--slug", SLUG]);
    correr("npx", ["tsx", "scripts/nuevo-cliente/index.ts", "base", "--slug", SLUG, "--nombre", "Resto Backup", "--sucursal", "Centro", "--email", "d@resto-backup.test", "--confirmo-base", `127.0.0.1:${P_ORIGEN}`], { DATABASE_URL: urlO });
    process.env.DATABASE_URL = urlO;
    const { prisma } = await import("../../src/lib/prisma");
    const { registrarPagoPedido } = await import("../../src/lib/pedidos/registrar-pago");
    const tenant = await prisma.tenant.findFirstOrThrow();
    const sucursal = await prisma.sucursal.findFirstOrThrow();
    for (let i = 1; i <= 25; i++) {
      const p = await prisma.pedido.create({ data: { tenantId: tenant.id, sucursalId: sucursal.id, tipo: "delivery", estado: "recibido", total: 1000 + i } });
      await registrarPagoPedido({ pedidoId: p.id, monto: 1000 + i, metodo: "qr", referencia: `mp:${i}` });
    }
    await prisma.$disconnect();
    return huella(urlO);
  }, (h) => `${h.filas.pedidos} pedidos, ${h.filas.pagos} pagos, suma ${h.suma}`);

  await cron.medir("2. Apagado limpio de la base", () => origen.stop());

  const kb = await cron.medir("3. Empaquetar la carpeta de datos (.tgz)", () => {
    correr("tar", ["--force-local", "-czf", barra(tgz), "-C", barra(dirname(datosOrigen)), basename(datosOrigen)]);
    return Math.round(statSync(tgz).size / 1024);
  }, (k) => `${k} KB`);

  await cron.medir("4. Cifrar con gpg (AES-256, frase aleatoria)", () => {
    correr("gpg", ["--batch", "--yes", "--pinentry-mode", "loopback", "--passphrase", frase, "--symmetric", "--cipher-algo", "AES256", "--output", barra(cifrado), barra(tgz)]);
    const bytes = readFileSync(cifrado);
    ok(!bytes.includes(Buffer.from("PG_VERSION")) && !bytes.includes(Buffer.from("audit_log")), "el archivo cifrado no contiene texto legible de la base");
    rmSync(tgz);
    rmSync(datosOrigen, { recursive: true, force: true });
    ok(!existsSync(datosOrigen), "se borró la base original (solo queda la copia cifrada)");
  });

  await cron.medir("5. La frase equivocada NO abre la copia", () => {
    const r = correr("gpg", ["--batch", "--yes", "--pinentry-mode", "loopback", "--passphrase", "frase-equivocada", "--decrypt", "--output", barra(join(raiz, "mal.tgz")), barra(cifrado)], {}, { sinFallar: true });
    ok(r.codigo !== 0 && !existsSync(join(raiz, "mal.tgz")), "gpg rechaza la frase incorrecta y no produce archivo");
  });

  await cron.medir("6. Descifrar y desempaquetar con la frase correcta", () => {
    correr("gpg", ["--batch", "--yes", "--pinentry-mode", "loopback", "--passphrase", frase, "--decrypt", "--output", barra(tgz), barra(cifrado)]);
    correr("tar", ["--force-local", "-xzf", barra(tgz), "-C", barra(raiz)]);
    rmSync(datosRestaurados, { recursive: true, force: true });
    renameSync(datosOrigen, datosRestaurados);
  });

  const despues = await cron.medir("7. Levantar la copia restaurada en otro puerto y contar", async () => {
    const restaurada = nuevo(datosRestaurados, P_RESTAURADA);
    await restaurada.start();
    try {
      return await huella(urlBase(P_RESTAURADA));
    } finally {
      await restaurada.stop();
    }
  }, (h) => `${h.filas.pedidos} pedidos, ${h.filas.pagos} pagos, suma ${h.suma}`);

  for (const t of TABLAS) ok(antes.filas[t] === despues.filas[t], `${t}: ${antes.filas[t]} filas antes y ${despues.filas[t]} después`);
  ok(antes.suma === despues.suma, `suma de pagos idéntica (${antes.suma})`);
  ok(antes.hashes === despues.hashes, "los hashes de clave de los usuarios son idénticos");
  void kb;
} catch (e) {
  console.log(resultados.join("\n"));
  console.log("\n✖ FALLÓ:", e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  if (existsSync(envFile)) rmSync(envFile);
  try {
    rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {
    /* carpeta temporal */
  }
}

console.log(resultados.join("\n"));
console.log("\n" + cron.tabla());

// El pool de Prisma y los procesos hijos pueden dejar el proceso colgado: salir explícitamente.
process.exit(process.exitCode ?? 0);
