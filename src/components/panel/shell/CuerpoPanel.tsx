"use client";

import type { ReactNode } from "react";
import { rolPanel } from "@/lib/panel/rol-panel";
import { itemsVisibles } from "./filtrar-nav";
import { useSesionPanel } from "./SesionContext";
import BarraLateral from "./BarraLateral";
import BarraMovil from "./BarraMovil";

// Arma la estructura una vez que se sabe quién es el usuario.
export default function CuerpoPanel({ children }: { children: ReactNode }) {
  const sesion = useSesionPanel();
  const items = itemsVisibles(sesion?.permisos);
  const rol = rolPanel({ roles: sesion?.roles ?? [], permisos: sesion?.permisos ?? [] });

  return (
    <div className="pn-raiz min-h-dvh bg-pn-fondo text-pn-tinta md:flex">
      <BarraLateral items={items} />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-7">{children}</main>
      <BarraMovil items={items} rol={rol} />
    </div>
  );
}
