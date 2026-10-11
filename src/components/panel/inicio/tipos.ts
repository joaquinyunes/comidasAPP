// Lo que devuelven las APIs que alimentan el resumen del turno.

export interface ResumenApi {
  ventasHoy: number;
  ventasAyer: number;
  ventasMes: number;
  ticketPromedio: number;
  cobrosHoy: number;
  mesasOcupadas: number;
  mesasTotales: number;
  pedidosActivos: number;
  stockCritico: number;
}

export interface ControlApi {
  platosDevueltos: number;
  porMotivo: Record<string, number>;
  tiempoPromedioServicioMin: number;
  mermas: number;
  mesasDesatendidas: Array<number | string>;
  rendimiento: { mozo: string | null; pedidos: number }[];
}
