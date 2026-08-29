export interface ClienteRecurrente {
  id: string;
  nombre: string;
  nivel: string;
  totalVisitas: number;
  puntos: number;
  totalGastado: number | string;
}

export interface MesaOpcion {
  id: string;
  numero: number | string;
  sector?: { nombre?: string } | null;
}

export interface SugerenciaProducto {
  productoId: string;
  nombre: string;
  cantidad: number;
}

export interface Reconocido {
  cliente?: {
    nombre: string;
    nivel: string;
    puntos: number;
    totalVisitas: number;
    alergias?: string[];
  } | null;
  sugerencias: SugerenciaProducto[];
}

export interface TopCliente {
  id: string;
  nombre: string;
  puntos: number;
}

export interface Logistica {
  data: {
    totalClientes: number;
    cuponesActivos: number;
    porNivel: Record<string, number>;
    topClientes: TopCliente[];
  };
}
