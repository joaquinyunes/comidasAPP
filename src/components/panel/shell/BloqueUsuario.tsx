"use client";

import Link from "next/link";
import BotonSalir from "@/components/dashboard/BotonSalir";
import { useSesionPanel } from "./SesionContext";

// Quién está usando el panel, con acceso a su cuenta y a salir.
export default function BloqueUsuario({ onNavegar }: { onNavegar?: () => void }) {
  const sesion = useSesionPanel();
  const nombre = sesion?.nombre ?? "…";
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return (
    <div className="border-t border-pn-linea pt-3">
      <Link
        href="/dashboard/cuenta"
        onClick={onNavegar}
        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-pn-hundido"
      >
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full bg-pn-marca text-sm font-semibold text-pn-tinta"
        >
          {inicial}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-pn-tinta">{nombre}</span>
          <span className="block truncate text-xs text-pn-suave">{sesion?.roles?.join(", ") || "Sin rol"}</span>
        </span>
      </Link>
      <BotonSalir />
    </div>
  );
}
