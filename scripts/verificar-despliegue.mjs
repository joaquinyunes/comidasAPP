// Chequeo ANTES de desplegar: variables obligatorias y migraciones aplicadas. Solo lectura.
//
//   node scripts/verificar-despliegue.mjs --env .env.cliente-mi-restaurante
//   node scripts/verificar-despliegue.mjs                 (usa las variables del entorno actual)
//   node scripts/verificar-despliegue.mjs --sin-base      (solo variables, sin conectarse a la base)
//
// Sale con código 1 si algo obligatorio falla. NO imprime valores secretos, solo si están bien o mal.
// La base: solo SELECT sobre _prisma_migrations (sesión en solo lectura) y `prisma migrate status`.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "dotenv";

const ERROR = "error";
const AVISO = "aviso";
const MARCADORES_DE_EJEMPLO = /cambiar|changeme|ejemplo|example|secret|xxx|password|completar/i;

const hay = (v) => typeof v === "string" && v.trim() !== "";
const caracteresDistintos = (v) => new Set(v).size;

// Variables. Función pura: recibe un objeto de entorno y devuelve una lista de resultados.
export function evaluarVariables(env) {
  const r = [];
  const chequeo = (nombre, ok, detalle, nivel = ERROR) => r.push({ nombre, ok, detalle: ok ? "bien" : detalle, nivel });

  let urlOk = false;
  if (hay(env.DATABASE_URL)) {
    try {
      urlOk = /^postgres(ql)?:$/.test(new URL(env.DATABASE_URL).protocol);
    } catch {
      urlOk = false;
    }
  }
  chequeo("DATABASE_URL", urlOk, "falta o no es una URL postgresql://…");

  const jwt = env.JWT_SECRET ?? "";
  chequeo(
    "JWT_SECRET fuerte",
    jwt.length >= 32 && caracteresDistintos(jwt) >= 12 && !MARCADORES_DE_EJEMPLO.test(jwt),
    "falta, tiene menos de 32 caracteres, es repetitivo o parece el valor de ejemplo (generá uno con el comando de .env.example)"
  );

  chequeo(
    "MERCADOPAGO_WEBHOOK_SECRET",
    hay(env.MERCADOPAGO_WEBHOOK_SECRET) && env.MERCADOPAGO_WEBHOOK_SECRET.length >= 16,
    "falta (o es muy corta): sin ella el webhook responde 500 y los pagos con Mercado Pago no se acreditan"
  );

  const qr = env.QR_LOCAL_CODIGO ?? "";
  chequeo("QR_LOCAL_CODIGO", qr.length >= 8 && !MARCADORES_DE_EJEMPLO.test(qr), "falta, es corto o es el valor de ejemplo: sin un código propio cualquiera puede pedir «desde una mesa»");

  chequeo("MERCADOPAGO_ACCESS_TOKEN", hay(env.MERCADOPAGO_ACCESS_TOKEN), "falta: no se puede cobrar con Mercado Pago");
  if (hay(env.MERCADOPAGO_ACCESS_TOKEN) && /^TEST-/.test(env.MERCADOPAGO_ACCESS_TOKEN)) {
    r.push({ nombre: "MERCADOPAGO_ACCESS_TOKEN de producción", ok: false, detalle: "es un token de PRUEBA (TEST-): los cobros no son reales", nivel: AVISO });
  }

  chequeo(
    "sin NEXT_PUBLIC_QR_LOCAL_CODIGO",
    !hay(env.NEXT_PUBLIC_QR_LOCAL_CODIGO),
    "está definida: Next la publica en el JavaScript de todo el sitio. Renombrala a QR_LOCAL_CODIGO y cambiá el valor"
  );
  return r;
}

// Migraciones. Función pura: carpetas del repo vs. nombres aplicados (con finished_at) en la base.
export function evaluarMigraciones(carpetas, aplicadas) {
  const faltan = carpetas.filter((c) => !aplicadas.includes(c));
  return [
    {
      nombre: `migraciones aplicadas (${carpetas.length} en el repo)`,
      ok: faltan.length === 0,
      detalle: faltan.length === 0 ? "bien" : `sin aplicar: ${faltan.join(", ")}`,
      nivel: ERROR,
    },
  ];
}

const sinUrls = (t) => t.replace(/postgres(ql)?:\/\/\S+/gi, "<url>");

async function aplicadasEnBase(url) {
  const { default: pg } = await import("pg");
  const cliente = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10_000, statement_timeout: 10_000 });
  await cliente.connect();
  try {
    await cliente.query("SET default_transaction_read_only = on");
    const existe = (await cliente.query("SELECT to_regclass('public._prisma_migrations') AS t")).rows[0].t;
    if (!existe) return null;
    return (await cliente.query("SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL")).rows.map((f) => f.migration_name);
  } finally {
    await cliente.end();
  }
}

async function evaluarBase(env, raiz) {
  const carpetas = readdirSync(join(raiz, "prisma", "migrations"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  let aplicadas;
  try {
    aplicadas = await aplicadasEnBase(env.DATABASE_URL);
  } catch (e) {
    return [{ nombre: "conexión a la base (solo lectura)", ok: false, detalle: sinUrls(String(e.message ?? e)).slice(0, 200), nivel: ERROR }];
  }
  if (aplicadas === null) {
    return [{
      nombre: "tabla _prisma_migrations",
      ok: false,
      detalle: "no existe: la base se armó con `db push`. Antes de `migrate deploy` hay que marcar la base actual con `prisma migrate resolve --applied 0001_init_bloque2` y `--applied 0005_alinear_esquema` (docs/PENDIENTES-VENTA.md)",
      nivel: ERROR,
    }];
  }
  const resultado = evaluarMigraciones(carpetas, aplicadas);

  // Segunda opinión de Prisma (solo lectura).
  const p = spawnSync("npx", ["prisma", "migrate", "status"], { cwd: raiz, env: { ...process.env, DATABASE_URL: env.DATABASE_URL }, encoding: "utf8", shell: true });
  const cola = sinUrls(`${p.stdout ?? ""}${p.stderr ?? ""}`).trim().split("\n").slice(-4).join(" | ");
  resultado.push({ nombre: "prisma migrate status", ok: p.status === 0, detalle: p.status === 0 ? "bien" : cola.slice(0, 300), nivel: ERROR });
  return resultado;
}

export function imprimir(resultados) {
  for (const x of resultados) {
    const marca = x.ok ? "✔" : x.nivel === AVISO ? "⚠" : "✖";
    console.log(`${marca} ${x.nombre}${x.ok ? "" : ` — ${x.detalle}`}`);
  }
  const errores = resultados.filter((x) => !x.ok && x.nivel === ERROR).length;
  const avisos = resultados.filter((x) => !x.ok && x.nivel === AVISO).length;
  console.log(errores === 0 ? `\nListo para desplegar (${avisos} aviso/s).` : `\nNO desplegar: ${errores} problema/s obligatorio/s.`);
  return errores;
}

async function main() {
  const args = process.argv.slice(2);
  const iEnv = args.indexOf("--env");
  const raiz = join(fileURLToPath(import.meta.url), "..", "..");
  let env = { ...process.env };
  if (iEnv >= 0) {
    const archivo = args[iEnv + 1];
    if (!archivo || !existsSync(archivo)) {
      console.error(`✖ No encuentro el archivo ${archivo ?? "(falta el nombre después de --env)"}`);
      process.exit(2);
    }
    env = { ...env, ...parse(readFileSync(archivo)) };
  }
  const resultados = evaluarVariables(env);
  const urlValida = resultados.find((x) => x.nombre === "DATABASE_URL")?.ok;
  if (!args.includes("--sin-base") && urlValida) resultados.push(...(await evaluarBase(env, raiz)));
  process.exit(imprimir(resultados) === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
