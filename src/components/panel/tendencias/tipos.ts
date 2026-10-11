// Forma de lo que devuelve GET /api/reportes/tendencias.

export interface VentaDia {
  fecha: string; // YYYY-MM-DD
  total: number;
  cobros: number;
}

export interface MasVendido {
  productoId: string;
  nombre: string;
  unidades: number;
  facturado: number;
}

export interface Tendencias {
  ventasPorDia: VentaDia[];
  masVendidos: MasVendido[];
  pedidosPorHora: number[]; // 24 posiciones
}
