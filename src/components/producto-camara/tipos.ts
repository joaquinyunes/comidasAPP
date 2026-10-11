// Forma mínima que el visor necesita de un producto. Todas las pantallas
// (landing, carta, pedidos) adaptan sus propios tipos a ésta.
export interface ProductoCamara {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  precio?: number | null;
  // Medida real cargada en la BD (cm). Si falta se estima por nombre.
  tamanoCm?: number | null;
  pesoGr?: number | null;
  // Lista explícita de lo que trae el plato. Si falta se deduce de la descripción.
  incluye?: string[] | null;
  alergenos?: string[] | null;
  calorias?: number | null;
  nivelPicante?: number | null;
}
