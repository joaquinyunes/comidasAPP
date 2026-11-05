// Solo rutas internas del panel: nunca una URL externa ni "//host" (open redirect).
const PERMITIDO = /^\/dashboard(\/[\w\-./]*)?(\?[\w\-.=&%]*)?$/;

export function destinoSeguro(volver: string | null): string {
  return volver && !volver.includes("..") && PERMITIDO.test(volver) ? volver : "/dashboard";
}
