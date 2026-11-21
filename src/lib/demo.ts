// Entorno de DEMO: un despliegue aparte (su propia base y su propio proyecto de Vercel) con datos de
// ejemplo. Se activa con DEMO_MODE=1 (en tiempo de build) y muestra un cartel fijo en todo el sitio.
// Regla: el demo NUNCA apunta a la base real. Una base de demo es local o lleva «demo» en su nombre
// (o en el host); scripts/verificar-despliegue.mjs y el seed lo exigen.

export const esModoDemo = (): boolean => process.env.DEMO_MODE === "1";

const HOSTS_LOCALES = ["localhost", "127.0.0.1", "[::1]", "::1"];

export function esBaseDeDemo(databaseUrl: string | undefined): boolean {
  try {
    const u = new URL(databaseUrl ?? "");
    if (HOSTS_LOCALES.includes(u.hostname)) return true;
    return /demo/i.test(u.pathname.replace(/^\//, "")) || /demo/i.test(u.hostname);
  } catch {
    return false;
  }
}
