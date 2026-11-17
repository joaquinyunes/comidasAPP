// V4 — Prueba del despliegue repetible DE CERO, todo local y cronometrado:
// Postgres vacío → migraciones → alta del restaurante → app en producción local → recorrido.
// Qué NO prueba: cuentas reales de Supabase / Vercel / Mercado Pago ni DNS.
//
//   $env:EMBEDDED_PG_DIR="<carpeta con embedded-postgres>"; npx tsx scripts/prueba-local/despliegue-de-cero.mts [--build]
//
// No toca ninguna base real: crea un clúster temporal en 127.0.0.1:54329 y lo borra al final.

import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { carpetaTemporal, cargarEmbeddedPg, correr, cronometro, esperarHttp, ignorarCierreDeConexiones, urlBase } from "./ayudas.mts";

ignorarCierreDeConexiones();
import { codigoTotp } from "../../src/lib/auth/totp";

const PG = 54329;
const APP = 3190;
const SLUG = "resto-prueba";
const EMAIL = "dueno@resto-prueba.test";
const conBuild = process.argv.includes("--build");
const url = urlBase(PG);
const cron = cronometro();
const resultados: string[] = [];
const ok = (cond: boolean, msg: string) => {
  resultados.push(`${cond ? "✔" : "✖"} ${msg}`);
  if (!cond) throw new Error("Falló la verificación: " + msg);
};

const datos = carpetaTemporal("cozizina-pg-");
const envFile = `.env.cliente-${SLUG}`;
const EmbeddedPostgres = await cargarEmbeddedPg();
const pg = new EmbeddedPostgres({ databaseDir: datos, user: "postgres", password: "prueba", port: PG, persistent: true });
let servidor: ReturnType<typeof spawn> | null = null;
let bd: import("pg").Client | undefined;

try {
  await cron.medir("1. Postgres vacío (initdb + arranque)", async () => {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("cozizina");
  });

  await cron.medir("2. Esquema: prisma migrate deploy + chequeo de deriva", () => {
    const r = correr("npx", ["prisma", "migrate", "deploy"], { DATABASE_URL: url });
    const d = correr("npx", ["prisma", "migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"], { DATABASE_URL: url }, { sinFallar: true });
    ok(d.codigo === 0, "la base armada solo con migraciones coincide con schema.prisma (sin deriva)");
    return r.salida.match(/(\d+) migrations? found/i)?.[0];
  }, (r) => r);

  await cron.medir("3. Secretos del cliente (comando env)", () => {
    correr("npx", ["tsx", "scripts/nuevo-cliente/index.ts", "env", "--slug", SLUG]);
  });

  const env = Object.fromEntries(
    readFileSync(envFile, "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
  ) as Record<string, string>;
  env.DATABASE_URL = url;

  const clave = await cron.medir("4. Alta del restaurante (comando base)", () => {
    const r = correr("npx", ["tsx", "scripts/nuevo-cliente/index.ts", "base", "--slug", SLUG, "--nombre", "Resto Prueba", "--sucursal", "Resto Prueba Centro", "--email", EMAIL, "--confirmo-base", `127.0.0.1:${PG}`], { DATABASE_URL: url });
    const m = r.salida.match(/Clave inicial[^:]*: (\S+)/);
    if (!m) throw new Error("No encontré la clave inicial en la salida del alta");
    return m[1];
  });

  const { Client } = await import("pg");
  bd = new Client({ connectionString: url });
  bd.on("error", () => {}); // al apagar Postgres la conexión cae: no es un fallo de la prueba
  await bd.connect();
  const contar = async (t: string) => Number((await bd!.query(`select count(*)::int n from ${t}`)).rows[0].n);

  await cron.medir("5. Verificar la base (sin datos de ejemplo)", async () => {
    ok((await contar("tenants")) === 1, "1 restaurante");
    ok((await contar("roles")) === 6, "6 roles");
    ok((await contar("usuarios")) === 1, "1 usuario (el administrador)");
    ok((await contar("productos")) === 0 && (await contar("clientes")) === 0 && (await contar("pedidos")) === 0, "0 productos, 0 clientes, 0 pedidos de ejemplo");
    const hash = (await bd!.query("select password_hash h from usuarios")).rows[0].h as string;
    ok(hash.startsWith("$2") && !hash.includes(clave), "la clave se guardó como hash bcrypt");
  });

  await cron.medir("6. Migraciones 0002–0004 en Postgres real", async () => {
    const cols = (await bd!.query("select column_name from information_schema.columns where table_name in ('pagos','usuarios') and column_name in ('referencia','totp_secreto','totp_activo')")).rows.length;
    ok(cols === 3, "columnas referencia, totp_secreto y totp_activo existen");
    const idx = (await bd!.query("select 1 from pg_indexes where indexname='pagos_pedido_id_referencia_key'")).rowCount;
    ok(idx === 1, "índice único pedido+referencia existe");
    const tenant = (await bd!.query("select id from tenants limit 1")).rows[0].id;
    await bd!.query("insert into audit_log (id, tenant_id, accion, entidad) values (gen_random_uuid(), $1, 'PRUEBA', 'X')", [tenant]);
    let bloqueado = false;
    try {
      await bd!.query("update audit_log set accion='MANIPULADO'");
    } catch (e) {
      bloqueado = /solo agregar/.test(String(e));
    }
    ok(bloqueado, "el trigger impide modificar el registro de auditoría");
    let bloqueadoDel = false;
    try {
      await bd!.query("delete from audit_log");
    } catch (e) {
      bloqueadoDel = /solo agregar/.test(String(e));
    }
    ok(bloqueadoDel, "el trigger impide borrar el registro de auditoría");
  });

  await cron.medir("6b. Migración 0006: un Gerente viejo recibe inventario y compras (idempotente)", async () => {
    await bd!.query(`update roles set permisos = '["pedidos:*","inventario:leer"]'::jsonb where nombre = 'Gerente'`);
    const sql = readFileSync("prisma/migrations/0006_permisos_gerente/migration.sql", "utf8");
    await bd!.query(sql);
    await bd!.query(sql);
    const p = (await bd!.query("select permisos from roles where nombre = 'Gerente'")).rows[0].permisos as string[];
    ok(p.includes("inventario:*") && p.includes("compras:*") && p.filter((x) => x === "compras:*").length === 1, "0006 agrega inventario:* y compras:* una sola vez aunque se corra dos veces");
  });

  await cron.medir("7. Pago duplicado: 10 webhooks simultáneos en Postgres real", async () => {
    process.env.DATABASE_URL = url;
    const { prisma } = await import("../../src/lib/prisma");
    const { registrarPagoPedido } = await import("../../src/lib/pedidos/registrar-pago");
    const tenant = await prisma.tenant.findFirstOrThrow();
    const sucursal = await prisma.sucursal.findFirstOrThrow();
    const pedido = await prisma.pedido.create({ data: { tenantId: tenant.id, sucursalId: sucursal.id, tipo: "delivery", estado: "recibido", total: 5000 } });
    const res = await Promise.all(Array.from({ length: 10 }, () => registrarPagoPedido({ pedidoId: pedido.id, monto: 5000, metodo: "qr", referencia: "mp:999" })));
    const pagos = await prisma.pago.count({ where: { pedidoId: pedido.id } });
    ok(res.every((r) => !("error" in r)), "ninguno de los 10 devolvió error");
    ok(pagos === 1, `un solo pago en la base (hay ${pagos})`);
    ok(res.filter((r) => "yaPagado" in r && !r.yaPagado).length === 1, "exactamente uno lo creó; los otros 9 recibieron el mismo pago");
    ok((await prisma.pedido.findUniqueOrThrow({ where: { id: pedido.id } })).estado === "pagado", "el pedido quedó pagado");

    // Dos cobros con DISTINTA referencia a la vez: el bloqueo de fila hace que solo uno salde el pedido.
    const p2 = await prisma.pedido.create({ data: { tenantId: tenant.id, sucursalId: sucursal.id, tipo: "delivery", estado: "recibido", total: 8000 } });
    await Promise.all([
      registrarPagoPedido({ pedidoId: p2.id, monto: 8000, metodo: "qr", referencia: "mp:aaa" }),
      registrarPagoPedido({ pedidoId: p2.id, monto: 8000, metodo: "qr", referencia: "mp:bbb" }),
    ]);
    ok((await prisma.pago.count({ where: { pedidoId: p2.id } })) === 1, "dos pagos distintos simultáneos: un solo pago en la base (FOR UPDATE real)");
    ok((await prisma.pedidoEvento.count({ where: { pedidoId: p2.id, evento: "PAGO_MP_SOBRANTE" } })) === 1, "el segundo quedó como alerta PAGO_MP_SOBRANTE");
    ok((await prisma.notificacion.count({ where: { tipo: "pago_sobrante" } })) === 1, "y se avisó al personal");

    // Pago menor al saldo: no marca pagado.
    const p3 = await prisma.pedido.create({ data: { tenantId: tenant.id, sucursalId: sucursal.id, tipo: "delivery", estado: "recibido", total: 6000 } });
    await registrarPagoPedido({ pedidoId: p3.id, monto: 2000, metodo: "qr", referencia: "mp:parcial" });
    ok((await prisma.pedido.findUniqueOrThrow({ where: { id: p3.id } })).estado === "recibido", "un pago menor al saldo NO marca el pedido como pagado");
    await prisma.$disconnect();
  });

  if (conBuild) {
    await cron.medir("8. Build de producción (lo que hace Vercel)", () => correr("npm", ["run", "build"], { DATABASE_URL: url }));
  }

  await cron.medir("9. App en modo producción: arranque", async () => {
    const next = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
    servidor = spawn(process.execPath, [next, "start", "-p", String(APP)], { env: { ...process.env, ...env, NODE_ENV: "production" }, stdio: "ignore" });
    await esperarHttp(`http://127.0.0.1:${APP}/api/salud`);
  });

  const base = `http://127.0.0.1:${APP}`;
  const post = (ruta: string, cuerpo: unknown, cookie = "") =>
    fetch(base + ruta, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify(cuerpo) });
  const cookies = (r: Response) => r.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

  await cron.medir("10. Recorrido: salud, login, sesión, 2FA, datos públicos", async () => {
    const salud = await fetch(base + "/api/salud");
    ok(salud.status === 200 && (await salud.json()).ok === true, "/api/salud responde ok con la base conectada");

    const mala = await post("/api/auth/login", { email: EMAIL, password: "clave-equivocada-123" });
    ok(mala.status === 401, "login con clave mala: 401");

    const login = await post("/api/auth/login", { email: EMAIL, password: clave });
    ok(login.status === 200, "login del administrador con la clave inicial: 200");
    const c = cookies(login);
    ok(/token=/.test(c) && /refresh=/.test(c), "cookies de acceso y refresco emitidas");

    const me = await fetch(base + "/api/auth/me", { headers: { cookie: c } });
    const meJson = await me.json();
    ok(me.status === 200 && meJson.data.email === EMAIL && meJson.data.permisos.includes("*"), "/api/auth/me devuelve al administrador");

    const sinSesion = await fetch(base + "/api/pagos");
    ok(sinSesion.status === 401, "/api/pagos sin sesión: 401");

    const ref = await fetch(base + "/api/auth/refresh", { method: "POST", headers: { cookie: c } });
    ok(ref.status === 200 && /token=/.test(cookies(ref)), "refresco de sesión emite acceso nuevo");
    const reuso = await fetch(base + "/api/auth/refresh", { method: "POST", headers: { cookie: c } });
    ok(reuso.status === 401, "el token de refresco ya usado no sirve (rotación)");

    const cNuevo = cookies(ref);
    const alta = await fetch(base + "/api/auth/2fa", { method: "POST", headers: { cookie: cNuevo } });
    const secreto = (await alta.json()).data.secreto as string;
    const conf = await fetch(base + "/api/auth/2fa", { method: "PUT", headers: { "content-type": "application/json", cookie: cNuevo }, body: JSON.stringify({ codigo: codigoTotp(secreto) }) });
    ok(conf.status === 200, "2FA activado con un código válido");
    const sinCodigo = await post("/api/auth/login", { email: EMAIL, password: clave });
    ok(sinCodigo.status === 401 && (await sinCodigo.json()).requiere2fa === true, "con 2FA activo el login pide el código");
    const conCodigo = await post("/api/auth/login", { email: EMAIL, password: clave, codigo: codigoTotp(secreto) });
    ok(conCodigo.status === 200, "login con clave + código: 200");

    const landing = await fetch(`${base}/api/publico/landing?tenant=${SLUG}`);
    const lj = await landing.json();
    ok(landing.status === 200 && (lj.carta ?? []).flatMap((x: { productos: unknown[] }) => x.productos).length === 0, "datos públicos del restaurante: carta vacía (sin datos de ejemplo)");

    const home = await fetch(base + "/");
    ok(home.status === 200, "la portada responde 200");

    const up = correr("bash", ["scripts/uptime.sh", base], {}, { sinFallar: true });
    ok(up.codigo === 0 && /OK .*\/api\/salud/.test(up.salida), "scripts/uptime.sh (V7) da OK para la portada y /api/salud");
  });

} catch (e) {
  console.log(resultados.join("\n"));
  console.log("\n✖ FALLÓ:", e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  servidor?.kill();
  await bd?.end().catch(() => {});
  try {
    await pg.stop();
  } catch {
    /* ya detenido */
  }
  if (existsSync(envFile)) rmSync(envFile);
  try {
    rmSync(datos, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {
    /* Windows aún tiene archivos abiertos: es una carpeta temporal, se limpia sola */
  }
}

console.log(resultados.join("\n"));
console.log("\n" + cron.tabla());

// El pool de Prisma y los procesos hijos pueden dejar el proceso colgado: salir explícitamente.
process.exit(process.exitCode ?? 0);
