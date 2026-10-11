"use client";

import Link from "next/link";
import MenuPorGrupos from "./MenuPorGrupos";
import BloqueUsuario from "./BloqueUsuario";
import type { ItemNav } from "./items-nav";

// Navegación fija para pantallas medianas y grandes.
export default function BarraLateral({ items }: { items: ItemNav[] }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-pn-linea bg-pn-papel md:flex">
      <div className="flex h-14 items-center border-b border-pn-linea px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-sm bg-pn-marca" />
          <span className="text-[15px] font-semibold tracking-tight">Cozizina</span>
          <span className="text-xs text-pn-suave">panel</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <MenuPorGrupos items={items} />
      </div>

      <div className="px-2 pb-3">
        <BloqueUsuario />
      </div>
    </aside>
  );
}
