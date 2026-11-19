// Lo que devuelven las APIs que alimentan el resumen del turno.

export interface ResumenApi {
  soloOperativo?: boolean; // sin permiso de reportes: las cifras de plata vienen en cero y no se muestran
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
