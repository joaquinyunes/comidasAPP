// ¿El usuario tiene este permiso? Soporta los comodines "recurso:*" y "*".
export function tienePermiso(permisos: string[] | undefined, requerido: string): boolean {
  if (!permisos) return false;
  if (permisos.includes("*")) return true;
  if (permisos.includes(requerido)) return true;
  const [recurso] = requerido.split(":");
  return permisos.includes(`${recurso}:*`);
}
