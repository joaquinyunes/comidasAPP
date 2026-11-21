// El seed de demo crea usuarios con mails conocidos (admin@cozizina.com…) y una clave común.
// En producción solo puede correr con SEED_PASSWORD fuerte; y el valor de desarrollo ("admin123")
// nunca se usa fuera de local.

export function claveDelSeed(env: { NODE_ENV?: string; SEED_PASSWORD?: string }): string {
  const clave = env.SEED_PASSWORD ?? "";
  if (env.NODE_ENV === "production") {
    if (clave.length < 12) {
      throw new Error("El seed no corre en producción sin SEED_PASSWORD de al menos 12 caracteres (cargaría usuarios demo con clave débil).");
    }
    return clave;
  }
  return clave || "admin123"; // solo desarrollo local
}

// El seed carga usuarios demo y PISA datos: solo corre contra una base local, salvo que se confirme
// el host exacto de la base remota con `--confirmo-base <host>` (igual que el alta de clientes).
// En una base remota, además de confirmar el host, la base tiene que ser de DEMO (lleva «demo» en el nombre o en el host):
// el seed nunca debe poder correr contra una base de producción, ni siquiera a propósito.
const HOSTS_LOCALES = ["localhost", "127.0.0.1", "[::1]", "::1"];

export function verificarBaseDelSeed(databaseUrl: string | undefined, argv: string[]): void {
  let host = "";
  try {
    host = new URL(databaseUrl ?? "").hostname;
  } catch {
    throw new Error("DATABASE_URL no está definida o no es una URL válida: el seed no corre.");
  }
  if (HOSTS_LOCALES.includes(host)) return;
  const i = argv.indexOf("--confirmo-base");
  if (i >= 0 && argv[i + 1] === host) {
    if (!/demo/i.test(new URL(databaseUrl ?? "").pathname) && !/demo/i.test(host)) {
      throw new Error(`El seed solo corre en una base remota de DEMO: el nombre de la base o el host tiene que incluir «demo» (${host}).`);
    }
    return;
  }
  throw new Error(`El seed escribe datos de demostración y NO corre contra una base remota (${host}). Si es a propósito, agregá: --confirmo-base ${host}`);
}
