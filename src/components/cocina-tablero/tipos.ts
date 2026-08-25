export interface ItemComanda {
  id: string;
  nombre: string;
  estacion: string | null;
  cantidad: number;
  notas: string | null;
  estado: string;
  urgente: boolean;
}

export interface Comanda {
  pedidoId: string;
  estado: string;
  tipo: string;
  mesa: string | null;
  desde: string;
  items: ItemComanda[];
}
