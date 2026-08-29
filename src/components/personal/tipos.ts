export interface ChecklistItem {
  id: string;
  descripcion: string;
}

export interface ChecklistPlantilla {
  id: string;
  nombre: string;
  items: ChecklistItem[];
  _count: { items: number; ejecuciones: number };
}

export interface RendimientoFila {
  empleadoId: string;
  nombre: string;
  turnos: number;
  horasTrabajadas: number;
  pedidosAtendidos: number;
  ventasTotales: number;
  ventasPorHora: number;
  tiempoPromedioPreparacionMin: number | null;
}
