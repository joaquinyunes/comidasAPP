"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/gemelo", label: "Gemelo Digital", icon: "🗺️" },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/dashboard/reservas", label: "Reservas", icon: "📅" },
  { href: "/dashboard/stock", label: "Stock", icon: "📦" },
  { href: "/dashboard/sucursales", label: "Sucursales", icon: "🏬" },
  { href: "/dashboard/personal", label: "Personal", icon: "🧑‍🍳" },
  { href: "/dashboard/friccion", label: "Fricción", icon: "🔌" },
  { href: "/dashboard/fidelizacion", label: "Fidelización", icon: "⭐" },
  { href: "/dashboard/operativo", label: "Operativo", icon: "🍳" },
  { href: "/dashboard/cocina", label: "Cocina", icon: "👨‍🍳" },
  { href: "/dashboard/mozo", label: "Mozo", icon: "🤵" },
  { href: "/dashboard/dueno", label: "Dueño", icon: "📈" },
  { href: "/dashboard/delivery", label: "Delivery", icon: "🛵" },
  { href: "/dashboard/compras", label: "Compras", icon: "🛒" },
  { href: "/dashboard/trazabilidad", label: "Trazabilidad", icon: "🔎" },
  { href: "/dashboard/mantenimiento", label: "Mantenimiento", icon: "🔧" },
  { href: "/dashboard/eventos", label: "Eventos", icon: "🎉" },
  { href: "/dashboard/alcance", label: "Alcance", icon: "🌐" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "👥" },
  { href: "/dashboard/caja", label: "Caja", icon: "💰" },
  { href: "/dashboard/config", label: "Configuración", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-lg">
              Restaurant<span className="text-red-500">OS</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <p>RestaurantOS v0.1.0</p>
          <p>© 2026</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
