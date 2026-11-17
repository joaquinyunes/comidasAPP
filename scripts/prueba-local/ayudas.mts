// Ayudas de las pruebas locales (V4 y S10): Postgres embebido, comandos y cronómetro.
// Requiere `embedded-postgres` instalado FUERA del proyecto:
//   mkdir %TEMP%\pg && cd %TEMP%\pg && npm init -y && npm i embedded-postgres
//   y exportar EMBEDDED_PG_DIR=<esa carpeta>
// (no es dependencia del proyecto a propósito: es solo una herramienta de prueba).

import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function cargarEmbeddedPg() {
  const dir = process.env.EMBEDDED_PG_DIR;
  if (!dir) throw new Error("Definí EMBEDDED_PG_DIR con la carpeta donde instalaste embedded-postgres (ver el encabezado de ayudas.mts).");
  const mod = await import(pathToFileURL(join(dir, "node_modules", "embedded-postgres", "dist", "index.js")).href);
  return mod.default as new (o: Record<string, unknown>) => {
    initialise(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    createDatabase(n: string): Promise<void>;
  };
}

export const carpetaTemporal = (prefijo: string) => mkdtempSync(join(tmpdir(), prefijo));

export function urlBase(puerto: number, base = "cozizina") {
  return `postgresql://postgres:prueba@127.0.0.1:${puerto}/${base}`;
}

export interface Paso {
  paso: string;
  segundos: number;
  nota?: string;
}

export function cronometro() {
  const pasos: Paso[] = [];
  return {
    pasos,
    async medir<T>(paso: string, fn: () => Promise<T> | T, nota?: (r: T) => string | undefined): Promise<T> {
      const t0 = performance.now();
      const r = await fn();
      pasos.push({ paso, segundos: Math.round((performance.now() - t0) / 100) / 10, nota: nota?.(r) });
      return r;
    },
    tabla() {
      const total = pasos.reduce((a, p) => a + p.segundos, 0);
      return [
        "| Paso | Segundos | Nota |",
        "|---|---|---|",
        ...pasos.map((p) => `| ${p.paso} | ${p.segundos} | ${p.nota ?? ""} |`),
        `| **Total** | **${Math.round(total * 10) / 10}** | |`,
      ].join("\n");
    },
  };
}

// Corre un comando del proyecto; devuelve la salida. Nunca imprime variables de entorno.
export function correr(cmd: string, args: string[], env: Record<string, string> = {}, opciones: { sinFallar?: boolean } = {}) {
  const citados = args.map((a) => (/\s/.test(a) ?`"${a}"` : a));
  const r = spawnSync(cmd, citados, { env: { ...process.env, ...env }, encoding: "utf8", shell: true, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !opciones.sinFallar) {
    throw new Error(`Falló: ${cmd} ${args.join(" ")}\n${(r.stdout ?? "").slice(-1500)}\n${(r.stderr ?? "").slice(-1500)}`);
  }
  return { salida: `${r.stdout ?? ""}${r.stderr ?? ""}`, codigo: r.status ?? -1 };
}

export async function esperarHttp(url: string, ms = 90_000) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    try {
      const r = await fetch(url);
      if (r.status < 500 || r.status === 503) return;
    } catch {
      /* todavía no */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor no respondió en ${ms / 1000} s: ${url}`);
}

// Al apagar Postgres, el pool de `src/lib/prisma` (que Prisma no cierra) recibe un error de
// conexión caída sin manejar. Es esperado en estas pruebas y no es un fallo.
export function ignorarCierreDeConexiones() {
  process.on("uncaughtException", (e) => {
    if (!/Connection terminated|terminating connection|ECONNRESET/.test(String(e))) throw e;
  });
}
