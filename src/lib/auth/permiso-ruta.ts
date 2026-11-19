// ============================================================
// Permiso que exige cada ruta de la API según el MÉTODO (mínimo privilegio).
// Antes solo ~11 handlers miraban permisos: el resto aceptaba a cualquier usuario con sesión
// (un mozo podía cobrar, ver auditoría, tocar cupones o compras).
// Las rutas que no figuran acá (auth, checklists de lectura/ejecución…) siguen pidiendo solo sesión:
// cada persona del salón hace sus propias tareas y ve lo suyo.
// ============================================================

// prefijo de la ruta → recurso de permisos. `escritura`: acción única para todos los métodos de escritura.
// `metodos` + `exacto` acotan la regla (la primera que coincide gana, por eso van antes que las generales).
interface Regla { prefijo: string; recurso: string; escritura?: "actualizar"; metodos?: string[]; exacto?: boolean }
const REGLAS: Regla[] = [
  { prefijo: "/api/personal/checklists", recurso: "rrhh", metodos: ["POST"], exacto: true }, // crear plantillas
  { prefijo: "/api/personal/checklists/ejecuciones", recurso: "rrhh" },
  { prefijo: "/api/personal/fichaje", recurso: "rrhh" },
  { prefijo: "/api/personal/rendimiento", recurso: "rrhh" },
  { prefijo: "/api/feedback", recurso: "reportes", escritura: "actualizar" },
  { prefijo: "/api/ia", recurso: "reportes", escritura: "actualizar" },
  { prefijo: "/api/sectores", recurso: "config", escritura: "actualizar" },
  { prefijo: "/api/pagos", recurso: "pagos" },
  { prefijo: "/api/pedidos", recurso: "pedidos" },
  { prefijo: "/api/cocina", recurso: "pedidos", escritura: "actualizar" },
  { prefijo: "/api/delivery", recurso: "pedidos", escritura: "actualizar" },
  { prefijo: "/api/carta", recurso: "pedidos" },
  { prefijo: "/api/mesas", recurso: "mesas", escritura: "actualizar" },
  { prefijo: "/api/salon", recurso: "mesas", escritura: "actualizar" },
  { prefijo: "/api/mozo", recurso: "mesas", escritura: "actualizar" },
  { prefijo: "/api/reservas", recurso: "reservas" },
  { prefijo: "/api/caja", recurso: "caja" },
  { prefijo: "/api/inventario", recurso: "inventario" },
  { prefijo: "/api/compras", recurso: "compras" },
  { prefijo: "/api/clientes", recurso: "clientes" },
  { prefijo: "/api/fidelizacion", recurso: "clientes" },
  { prefijo: "/api/marketing", recurso: "marketing" },
  { prefijo: "/api/rrhh", recurso: "rrhh" },
  { prefijo: "/api/reportes", recurso: "reportes", escritura: "actualizar" },
  { prefijo: "/api/dueno", recurso: "reportes", escritura: "actualizar" },
  { prefijo: "/api/configuracion", recurso: "config", escritura: "actualizar" },
  { prefijo: "/api/audit", recurso: "audit" },
];

const ACCION_POR_METODO: Record<string, string> = {
  GET: "leer",
  HEAD: "leer",
  POST: "crear",
  PUT: "actualizar",
  PATCH: "actualizar",
  DELETE: "eliminar",
};

export function permisoRequeridoApi(pathname: string, metodo: string): string | null {
  const m = metodo.toUpperCase();
  const regla = REGLAS.find(
    (r) => (r.metodos ? r.metodos.includes(m) : true) && (pathname === r.prefijo || (!r.exacto && pathname.startsWith(r.prefijo + "/")))
  );
  if (!regla) return null;
  const accion = ACCION_POR_METODO[m] ?? "actualizar";
  const final = accion !== "leer" && regla.escritura ? regla.escritura : accion;
  return `${regla.recurso}:${final}`;
}

// Soporta los comodines "recurso:*" y "*".
export function tienePermisoRuta(permisos: string[], requerido: string): boolean {
  if (permisos.includes("*") || permisos.includes(requerido)) return true;
  const [recurso] = requerido.split(":");
  return permisos.includes(`${recurso}:*`);
}
