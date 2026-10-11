import { tienePermiso } from "@/lib/panel/permisos";
import { ITEMS_NAV, ORDEN_GRUPOS, type GrupoNav, type ItemNav } from "./items-nav";

// Items que este usuario puede ver, según sus permisos.
export function itemsVisibles(permisos: string[] | undefined): ItemNav[] {
  return ITEMS_NAV.filter((i) => !i.permiso || tienePermiso(permisos, i.permiso));
}

export interface GrupoVisible {
  grupo: GrupoNav;
  items: ItemNav[];
}

// Agrupa los items visibles, omitiendo los grupos que quedan vacíos.
export function agruparItems(items: ItemNav[]): GrupoVisible[] {
  return ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    items: items.filter((i) => i.grupo === grupo),
  })).filter((g) => g.items.length > 0);
}

// ¿La ruta actual corresponde a este item? "/dashboard" solo coincide exacto.
export function estaActivo(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
