// V4 — Alta de un cliente nuevo. Dos pasos (ver docs/DESPLIEGUE-CLIENTE.md):
//
//   npx tsx scripts/nuevo-cliente/index.ts env --slug mi-restaurante
//       Escribe .env.cliente-mi-restaurante con secretos generados (no los imprime).
//
//   npx tsx scripts/nuevo-cliente/index.ts base --slug mi-restaurante --nombre "Mi Restaurante" \
//       --sucursal "Mi Restaurante Centro" --email dueno@correo.com --confirmo-base <host de la base>
//       Crea tenant, sucursal, roles y el administrador en la base de DATABASE_URL.
//       Imprime la clave inicial del administrador UNA vez, en esta terminal.
//
// Seguridad: "base" exige --confirmo-base con el host exacto de DATABASE_URL, para no escribir en
// la base equivocada (nunca apuntarlo a una base con datos reales de otro cliente).

import "dotenv/config";
import { existsSync, writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { generarSecreto, generarClaveAdmin, slugValido, hostDe } from "./secretos";
import { crearBaseCliente } from "./crear-base";

function args(): Record<string, string> {
  const out: Record<string, string> = {};
  const [, , , ...resto] = process.argv;
  for (let i = 0; i < resto.length; i += 2) out[resto[i].replace(/^--/, "")] = resto[i + 1] ?? "";
  return out;
}

function fallar(msg: string): never {
  console.error("✖ " + msg);
  process.exit(1);
}

function comandoEnv(a: Record<string, string>) {
  if (!slugValido(a.slug ?? "")) fallar("Falta --slug (3 a 40 caracteres: minúsculas, números y guiones).");
  const archivo = `.env.cliente-${a.slug}`;
  if (existsSync(archivo)) fallar(`${archivo} ya existe; borralo a mano si querés regenerar los secretos.`);
  const contenido = [
    `# Cliente: ${a.slug}. NO se sube al repo (.env* está ignorado). Cargá estos valores en Vercel (Production).`,
    `TENANT_SLUG=${a.slug}`,
    `JWT_SECRET=${generarSecreto(48)}`,
    `NEXT_PUBLIC_QR_LOCAL_CODIGO=${generarSecreto(9)}`,
    `NEXT_PUBLIC_APP_URL=https://COMPLETAR-DOMINIO-DEL-CLIENTE`,
    `DATABASE_URL=COMPLETAR-cadena-de-conexion-de-Supabase-del-cliente`,
    `MERCADOPAGO_ACCESS_TOKEN=`,
    `MERCADOPAGO_WEBHOOK_SECRET=`,
    `API_V1_KEYS=`,
    ``,
  ].join("\n");
  writeFileSync(archivo, contenido, { mode: 0o600 });
  console.log(`✔ Escribí ${archivo} con JWT_SECRET y código QR nuevos. Completá lo que dice COMPLETAR.`);
}

async function comandoBase(a: Record<string, string>) {
  if (!slugValido(a.slug ?? "")) fallar("Falta --slug válido.");
  if (!a.nombre || !a.email || !a.sucursal) fallar("Faltan --nombre, --sucursal y --email.");
  const url = process.env.DATABASE_URL;
  if (!url) fallar("DATABASE_URL no está definida (cargala desde .env.cliente-<slug>).");
  const host = hostDe(url);
  if (!host) fallar("DATABASE_URL no es una URL válida.");
  if (a["confirmo-base"] !== host) fallar(`Para evitar escribir en la base equivocada, pasá --confirmo-base ${host}`);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const claveAdmin = generarClaveAdmin();
    await crearBaseCliente(prisma, {
      nombre: a.nombre,
      slug: a.slug,
      sucursal: a.sucursal,
      adminEmail: a.email,
      adminNombre: a.nombre,
      claveAdmin,
    });
    console.log(`✔ Restaurante "${a.nombre}" creado en ${host}.`);
    console.log(`  Administrador: ${a.email}`);
    console.log(`  Clave inicial (se muestra una sola vez; pedí que la cambie en Mi cuenta): ${claveAdmin}`);
  } finally {
    await prisma.$disconnect();
  }
}

const comando = process.argv[2];
const a = args();
if (comando === "env") comandoEnv(a);
else if (comando === "base") comandoBase(a).catch((e) => fallar(e instanceof Error ? e.message : String(e)));
else fallar('Uso: index.ts env|base --slug ... (ver el encabezado del archivo)');
