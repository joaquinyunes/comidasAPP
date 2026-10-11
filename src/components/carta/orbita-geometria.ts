// Matemática de la órbita 3D (anillo de platos que gira). Todo en grados.

export function pasoGrados(total: number): number {
  return total > 0 ? 360 / total : 360;
}

// 1 = justo al frente, 0 = justo atrás. `angulo` es la rotación del anillo.
export function profundidad(indice: number, paso: number, angulo: number): number {
  const rad = ((indice * paso + angulo) * Math.PI) / 180;
  return (1 + Math.cos(rad)) / 2;
}

// Índice del plato que está al frente para una rotación dada.
export function indiceFrente(angulo: number, paso: number, total: number): number {
  if (total <= 0) return 0;
  const crudo = Math.round(-angulo / paso);
  return ((crudo % total) + total) % total;
}

// Acomoda el objetivo en un múltiplo exacto del paso (el plato queda centrado).
export function ajustarAlPaso(objetivo: number, paso: number): number {
  return Math.round(objetivo / paso) * paso;
}
