"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import BotonSalir from "./BotonSalir";
import { useSesion, tienePermiso } from "./useSesion";

interface ItemNav {
  href: string;
  label: string;
  icon: string;
  permiso?: string; // sin permiso => visible para todo usuario autenticado
}

const ITEMS: ItemNav[] = [
  { href: "/dashboard", label: "Inicio", icon: "📊" },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: "📋", permiso: "pedidos:leer" },
  { href: "/dashboard/cocina", label: "Cocina", icon: "👨‍🍳", permiso: "pedidos:leer" },
  { href: "/dashboard/caja", label: "Caja", icon: "💰", permiso: "caja:leer" },
  { href: "/dashboard/reservas", label: "Reservas", icon: "📅", permiso: "reservas:leer" },
  { href: "/dashboard/mesas", label: "QR mesas", icon: "🔳", permiso: "mesas:leer" },
  { href: "/dashboard/mozo", label: "Mozo", icon: "🤵", permiso: "mesas:leer" },
  { href: "/dashboard/inventario", label: "Inventario", icon: "📦", permiso: "inventario:leer" },
  { href: "/dashboard/crm", label: "Clientes", icon: "👥", permiso: "clientes:leer" },
  { href: "/dashboard/reportes", label: "Reportes", icon: "📈", permiso: "reportes:leer" },
  { href: "/dashboard/configuracion", label: "Config", icon: "⚙️", permiso: "config:leer" },
];

export default function NavLateral() {
  const pathname = usePathname();
  const sesion = useSesion();
  const [colapsado, setColapsado] = useState(false);

  const visibles = ITEMS.filter(
    (i) => !i.permiso || tienePermiso(sesion?.permisos, i.permiso)
  );

  const inicial = (sesion?.nombre ?? "?").trim().charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        colapsado ? "w-[68px]" : "w-60"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!colapsado && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="text-xl">🛸</span>
            <span className="font-bold text-sm text-gray-900">
              COZI<span className="text-red-500">ZINA</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setColapsado(!colapsado)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title={colapsado ? "Expandir" : "Colapsar"}
        >
          {colapsado ? "»" : "«"}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {visibles.map((item) => {
          const activo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                activo
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={colapsado ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!colapsado && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        {!colapsado && (
          <Link
            href="/dashboard/cuenta"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50"
            title="Mi cuenta"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {inicial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {sesion?.nombre ?? "…"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {sesion?.roles?.join(", ") || "sin rol"}
              </p>
            </div>
          </Link>
        )}
        <BotonSalir colapsado={colapsado} />
      </div>
    </aside>
  );
}
