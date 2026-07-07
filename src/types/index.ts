// ============================================
// TIPOS DEL SISTEMA
// ============================================

// Multi-tenancy
export interface TenantContext {
  tenantId: string;
  sucursalId?: string;
  usuarioId: string;
  roles: string[];
}

// Mesas
export type MesaEstado =
  | "libre"
  | "esperando_pedido"
  | "en_cocina"
  | "comiendo"
  | "esperando_cuenta"
  | "reservada"
  | "limpieza";

export interface Mesa {
  id: string;
  numero: string;
  capacidad: number;
  estado: MesaEstado;
  posicionX: number | null;
  posicionY: number | null;
  sector: string;
  mozo?: string;
  tiempoSentado?: number;
  totalConsumido?: number;
  pedidoActual?: Pedido;
}

// Pedidos
export type PedidoEstado =
  | "recibido"
  | "aceptado"
  | "en_preparacion"
  | "listo"
  | "entregado"
  | "cerrado"
  | "cancelado";

export type PedidoTipo = "mesa" | "delivery" | "retiro";

export interface Pedido {
  id: string;
  mesaId?: string;
  clienteId?: string;
  mozoId?: string;
  estado: PedidoEstado;
  tipo: PedidoTipo;
  notas?: string;
  total: number;
  items: PedidoItem[];
  createdAt: Date;
}

export interface PedidoItem {
  id: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
  estado: PedidoEstado;
  producto?: Producto;
}

// Menú
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  tiempoPreparacionMin?: number;
  nivelPicante: number;
  calorias?: number;
  alergenos: string[];
  disponible: boolean;
  destacado: boolean;
  tipo: string;
  categoria?: CategoriaMenu;
}

export interface CategoriaMenu {
  id: string;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  productos: Producto[];
}

// Clientes
export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  alergias: string[];
  dieta?: string;
  puntos: number;
  nivel: "bronce" | "plata" | "oro" | "diamante";
  totalGastado: number;
  totalVisitas: number;
}

// Empleados / Roles
export type RolNombre =
  | "dueño"
  | "gerente"
  | "cajero"
  | "mozo"
  | "chef"
  | "bartender"
  | "limpieza"
  | "rrhh"
  | "marketing";

// KDS
export interface KDSPedido {
  id: string;
  mesaNumero: string;
  sector: string;
  mozo: string;
  items: KDSItem[];
  tiempoEspera: number;
  prioridad: "normal" | "urgente";
}

export interface KDSItem {
  id: string;
  nombre: string;
  cantidad: number;
  notas?: string;
  alergenos?: string[];
  estado: PedidoEstado;
  tiempoInicio?: Date;
}

// Dashboard
export interface DashboardKPIs {
  ventasHoy: number;
  ventasAyer: number;
  ticketPromedio: number;
  mesasOcupadas: number;
  mesasTotales: number;
  pedidosActivos: number;
  clientesHoy: number;
  stockCritico: number;
}

// Estados del gemelo digital
export const MESA_COLORES: Record<MesaEstado, string> = {
  libre: "bg-green-500",
  esperando_pedido: "bg-yellow-500",
  en_cocina: "bg-blue-500",
  comiendo: "bg-purple-500",
  esperando_cuenta: "bg-red-500",
  reservada: "bg-gray-800",
  limpieza: "bg-gray-300",
};

export const MESA_LABELS: Record<MesaEstado, string> = {
  libre: "Libre",
  esperando_pedido: "Esperando pedido",
  en_cocina: "En cocina",
  comiendo: "Comiendo",
  esperando_cuenta: "Esperando cuenta",
  reservada: "Reservada",
  limpieza: "Limpieza",
};
