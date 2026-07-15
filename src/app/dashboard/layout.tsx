"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/dashboard/cocina", label: "Cocina", icon: "👨‍🍳" },
  { href: "/dashboard/mozo", label: "Mozo", icon: "🤵" },
  { href: "/dashboard/caja", label: "Caja", icon: "💰" },
  { href: "/dashboard/inventario", label: "Inventario", icon: "📦" },
  { href: "/dashboard/reservas", label: "Reservas", icon: "📅" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "👥" },
  { href: "/dashboard/reportes", label: "Reportes", icon: "📈" },
  { href: "/dashboard/configuracion", label: "Config", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="text-xl">🍕</span>
              <span className="font-bold text-sm text-gray-900">
                La <span className="text-red-500">Nonna</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                  isActive
                    ? "bg-red-50 text-red-600 font-medium shadow-sm shadow-red-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">Admin</p>
                <p className="text-[10px] text-gray-400 truncate">admin@pizzaria.com</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
