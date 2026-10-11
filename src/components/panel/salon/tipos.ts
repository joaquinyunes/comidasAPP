// Forma de lo que devuelven /api/salon/mesas y /api/salon/carta.

export interface ItemSalon {
  id: string;
  nombre: string;
  cantidad: number;
  estado: string;
  notas: string | null;
  urgente: boolean;
}

export interface PedidoSalon {
  id: string;
  estado: string;
  total: number;
  creadoEn: string;
  items: ItemSalon[];
}

export interface MesaSalon {
  id: string;
  numero: string;
  capacidad: number;
  estado: string;
  sector: string;
  ordenSector: number;
  segundosDesdeCambio: number;
  totalAbierto: number;
  platosListos: number;
  pedidos: PedidoSalon[];
}

export interface ItemCarta {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
  destacado: boolean;
  alergenos: string[];
}

export interface CategoriaCarta {
  categoria: string;
  items: ItemCarta[];
}
