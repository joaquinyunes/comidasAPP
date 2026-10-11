"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ATAJOS_POR_ROL, type RolPanel } from "@/lib/panel/rol-panel";
import { ITEMS_NAV, type ItemNav } from "./items-nav";
import { estaActivo } from "./filtrar-nav";
import MenuPorGrupos from "./MenuPorGrupos";
import BloqueUsuario from "./BloqueUsuario";

interface Props {
  items: ItemNav[];
  rol: RolPanel;
}

const MAX_ATAJOS = 4;

// Atajos fijos abajo (para el pulgar) + el resto del menú en una hoja.
export default function BarraMovil({ items, rol }: Props) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const visibles = new Set(items.map((i) => i.href));
  const atajos = ATAJOS_POR_ROL[rol]
    .filter((href) => visibles.has(href))
    .slice(0, MAX_ATAJOS)
    .map((href) => ITEMS_NAV.find((i) => i.href === href))
    .filter((i): i is ItemNav => Boolean(i));

  return (
    <>
      <nav
        aria-label="Atajos"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-pn-linea bg-pn-papel pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {atajos.map((item) => {
          const activo = estaActivo(item.href, pathname);
          const Icono = item.icono;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                activo ? "text-pn-tinta" : "text-pn-suave"
              )}
            >
              <Icono className="size-5" aria-hidden />
              {item.etiqueta}
              <span aria-hidden className={cn("h-0.5 w-6 rounded", activo ? "bg-pn-tinta" : "bg-transparent")} />
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-expanded={abierto}
          className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-pn-suave"
        >
          <Ellipsis className="size-5" aria-hidden />
          Más
          <span aria-hidden className="h-0.5 w-6" />
        </button>
      </nav>

      {abierto && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-pn-tinta/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-xl border-t border-pn-linea bg-pn-papel p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-2 flex items-center justify-between px-2.5">
              <p className="text-sm font-semibold">Menú</p>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="grid size-9 place-items-center rounded-md hover:bg-pn-hundido"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <MenuPorGrupos items={items} onNavegar={() => setAbierto(false)} />
            <div className="mt-4">
              <BloqueUsuario onNavegar={() => setAbierto(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
