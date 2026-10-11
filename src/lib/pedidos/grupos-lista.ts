// Cómo se agrupan los pedidos en la lista del panel.

export const GRUPOS_PEDIDOS = [
  { clave: "abiertos", etiqueta: "Abiertos", estados: ["recibido", "en_preparacion", "listo", "entregado"] },
  { clave: "por_cobrar", etiqueta: "Por cobrar", estados: ["listo", "entregado"] },
  { clave: "cerrados", etiqueta: "Cerrados", estados: ["pagado", "cancelado"] },
] as const;

export type ClaveGrupo = (typeof GRUPOS_PEDIDOS)[number]["clave"];

export function estadosDeGrupo(clave: string): readonly string[] {
  return GRUPOS_PEDIDOS.find((g) => g.clave === clave)?.estados ?? [];
}

export function pedidosDeGrupo<T extends { estado: string }>(pedidos: T[], clave: string): T[] {
  const estados = estadosDeGrupo(clave);
  return pedidos.filter((p) => estados.includes(p.estado));
}

// Un pedido todavía se puede cobrar si no está pagado ni cancelado.
export function esCobrable(estado: string): boolean {
  return !["pagado", "cancelado", "cerrado", "anulado"].includes(estado);
}

// Solo se cancela antes de que salga de cocina.
export function esCancelable(estado: string): boolean {
  return ["recibido", "en_preparacion"].includes(estado);
}
