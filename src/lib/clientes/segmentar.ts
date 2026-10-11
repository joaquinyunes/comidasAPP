// Segmentos de clientes pensados para actuar: a quién agradecer, a quién
// volver a invitar. Funciones puras sobre datos ya leídos.

export interface ClienteBase {
  totalVisitas: number;
  ultimaVisita: string | null;
}

export type Segmento = "todos" | "frecuentes" | "por_recuperar" | "nuevos";

export const DIAS_SIN_VOLVER = 30;
export const VISITAS_FRECUENTE = 3;

export function diasDesde(iso: string | null, ahora: number = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((ahora - t) / 86400000));
}

export function perteneceA(c: ClienteBase, segmento: Segmento, ahora: number = Date.now()): boolean {
  const dias = diasDesde(c.ultimaVisita, ahora);
  switch (segmento) {
    case "todos":
      return true;
    case "frecuentes":
      return c.totalVisitas >= VISITAS_FRECUENTE;
    case "por_recuperar":
      // Vino más de una vez, pero hace tiempo que no aparece.
      return c.totalVisitas >= 2 && dias !== null && dias >= DIAS_SIN_VOLVER;
    case "nuevos":
      return c.totalVisitas <= 1;
  }
}

// Número listo para wa.me (solo dígitos). Sin prefijo de país asume Argentina.
export function enlaceWhatsapp(telefono: string | null, mensaje?: string): string | null {
  if (!telefono) return null;
  let digitos = telefono.replace(/\D/g, "");
  if (digitos.length < 8) return null;
  if (digitos.startsWith("0")) digitos = digitos.replace(/^0+/, "");
  if (!digitos.startsWith("54")) digitos = `54${digitos}`;
  const base = `https://wa.me/${digitos}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
