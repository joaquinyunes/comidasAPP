import {
  Armchair,
  BookOpen,
  CalendarDays,
  ChartColumn,
  ChartLine,
  ChefHat,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  Heart,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Package,
  QrCode,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type GrupoNav = "servicio" | "cocina-caja" | "gestion" | "analisis" | "ajustes";

export interface ItemNav {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  grupo: GrupoNav;
  permiso?: string; // sin permiso => visible para todo usuario autenticado
}

export const TITULO_GRUPO: Record<GrupoNav, string> = {
  servicio: "Servicio",
  "cocina-caja": "Cocina y caja",
  gestion: "Gestión",
  analisis: "Análisis",
  ajustes: "Ajustes",
};

export const ORDEN_GRUPOS: GrupoNav[] = ["servicio", "cocina-caja", "gestion", "analisis", "ajustes"];

export const ITEMS_NAV: ItemNav[] = [
  { href: "/dashboard/mozo", etiqueta: "Salón", icono: Armchair, grupo: "servicio", permiso: "mesas:leer" },
  { href: "/dashboard/pedidos", etiqueta: "Pedidos", icono: ClipboardList, grupo: "servicio", permiso: "pedidos:leer" },
  { href: "/dashboard/reservas", etiqueta: "Reservas", icono: CalendarDays, grupo: "servicio", permiso: "reservas:leer" },
  { href: "/dashboard/delivery", etiqueta: "Delivery", icono: Truck, grupo: "servicio", permiso: "pedidos:leer" },

  { href: "/dashboard/cocina", etiqueta: "Cocina", icono: ChefHat, grupo: "cocina-caja", permiso: "pedidos:leer" },
  { href: "/dashboard/caja", etiqueta: "Caja", icono: Wallet, grupo: "cocina-caja", permiso: "caja:leer" },
  { href: "/dashboard/carta", etiqueta: "Carta", icono: BookOpen, grupo: "cocina-caja", permiso: "pedidos:leer" },

  { href: "/dashboard/inventario", etiqueta: "Inventario", icono: Package, grupo: "gestion", permiso: "inventario:leer" },
  { href: "/dashboard/compras", etiqueta: "Compras", icono: ShoppingCart, grupo: "gestion", permiso: "compras:leer" },
  { href: "/dashboard/rrhh", etiqueta: "Equipo", icono: UserCog, grupo: "gestion", permiso: "rrhh:leer" },
  { href: "/dashboard/personal", etiqueta: "Tareas y fichaje", icono: ClipboardCheck, grupo: "gestion", permiso: "rrhh:leer" },
  { href: "/dashboard/crm", etiqueta: "Clientes", icono: Users, grupo: "gestion", permiso: "clientes:leer" },
  { href: "/dashboard/fidelizacion", etiqueta: "Fidelización", icono: Heart, grupo: "gestion", permiso: "clientes:leer" },
  { href: "/dashboard/marketing", etiqueta: "Marketing", icono: Megaphone, grupo: "gestion", permiso: "marketing:leer" },

  { href: "/dashboard", etiqueta: "Resumen", icono: LayoutDashboard, grupo: "analisis", permiso: "reportes:leer" },
  { href: "/dashboard/dueno", etiqueta: "Control del dueño", icono: Gauge, grupo: "analisis", permiso: "reportes:leer" },
  { href: "/dashboard/reportes", etiqueta: "Reportes", icono: ChartColumn, grupo: "analisis", permiso: "reportes:leer" },
  { href: "/dashboard/bi", etiqueta: "Tendencias", icono: ChartLine, grupo: "analisis", permiso: "reportes:leer" },
  { href: "/dashboard/feedback", etiqueta: "Opiniones", icono: MessageSquare, grupo: "analisis", permiso: "reportes:leer" },

  { href: "/dashboard/mesas", etiqueta: "QR de mesas", icono: QrCode, grupo: "ajustes", permiso: "mesas:leer" },
  { href: "/dashboard/configuracion", etiqueta: "Configuración", icono: Settings, grupo: "ajustes", permiso: "config:leer" },
];
