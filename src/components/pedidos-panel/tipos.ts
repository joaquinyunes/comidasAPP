export interface ItemPedido {
  id: string;
  productoNombre: string;
  cantidad: number;
  subtotal: number;
  estado: string;
  anulado: boolean;
}

export interface PedidoLista {
  id: string;
  mesaNumero?: string | null;
  clienteNombre?: string | null;
  estado: string;
  tipo: string;
  total: number;
  notas: string | null;
  items: ItemPedido[];
  createdAt: string;
}
