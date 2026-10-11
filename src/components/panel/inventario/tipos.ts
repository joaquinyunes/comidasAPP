// Forma de lo que devuelve GET /api/inventario.

export type EstadoStock = "ok" | "bajo" | "critico";

export interface IngredienteStock {
  id: string;
  sucursalId: string;
  ingredienteId: string;
  lote: string | null;
  fechaVencimiento: string | null;
  cantidadActual: number;
  cantidadMinima: number;
  cantidadMaxima: number;
  estado: EstadoStock;
  valorTotal: number;
  ingrediente: {
    id: string;
    nombre: string;
    unidadMedida: string;
    costoUnitario: string | number;
  };
}
