import { tienePermiso } from "./permisos";

// El panel se organiza alrededor de lo que cada persona hace en el
// turno. Esto decide cuál es "su" pantalla de inicio.

export type RolPanel = "jefe" | "mozo" | "cocina" | "caja";

interface Entrada {
  roles: string[];
  permisos: string[];
}

const NOMBRES_COCINA = ["cocinero", "cocina", "chef", "barman", "barra", "parrillero", "pizzero"];
const NOMBRES_MOZO = ["mozo", "mesero", "camarero", "salon", "salón"];
const NOMBRES_CAJA = ["cajero", "caja"];

function coincide(roles: string[], nombres: string[]): boolean {
  return roles.some((r) => nombres.some((n) => r.toLowerCase().includes(n)));
}

export function rolPanel({ roles, permisos }: Entrada): RolPanel {
  // Quien ve reportes (o todo) conduce el local: ve el resumen.
  if (tienePermiso(permisos, "reportes:leer")) return "jefe";

  if (coincide(roles, NOMBRES_COCINA)) return "cocina";
  if (coincide(roles, NOMBRES_CAJA)) return "caja";
  if (coincide(roles, NOMBRES_MOZO)) return "mozo";

  // Rol a medida: se deduce de lo que puede hacer.
  if (tienePermiso(permisos, "caja:leer")) return "caja";
  if (tienePermiso(permisos, "mesas:leer")) return "mozo";
  if (tienePermiso(permisos, "pedidos:leer")) return "cocina";
  return "mozo";
}

export const INICIO_POR_ROL: Record<RolPanel, string> = {
  jefe: "/dashboard",
  mozo: "/dashboard/mozo",
  cocina: "/dashboard/cocina",
  caja: "/dashboard/caja",
};

// Atajos de la barra inferior del celular, en orden de uso del rol.
export const ATAJOS_POR_ROL: Record<RolPanel, string[]> = {
  jefe: ["/dashboard", "/dashboard/mozo", "/dashboard/cocina", "/dashboard/caja"],
  mozo: ["/dashboard/mozo", "/dashboard/pedidos", "/dashboard/reservas", "/dashboard/cuenta"],
  cocina: ["/dashboard/cocina", "/dashboard/inventario", "/dashboard/cuenta"],
  caja: ["/dashboard/caja", "/dashboard/pedidos", "/dashboard/reservas", "/dashboard/cuenta"],
};
