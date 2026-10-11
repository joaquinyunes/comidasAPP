// Tonos semánticos del panel. El color siempre acompaña a un texto:
// nunca se usa solo para comunicar un estado.

export type Tono = "neutro" | "ok" | "aviso" | "peligro" | "info";

export const CLASE_TONO: Record<Tono, string> = {
  neutro: "bg-pn-hundido text-pn-tinta",
  ok: "bg-pn-ok-fondo text-pn-ok",
  aviso: "bg-pn-aviso-fondo text-pn-aviso",
  peligro: "bg-pn-peligro-fondo text-pn-peligro",
  info: "bg-pn-info-fondo text-pn-info",
};

export const CLASE_BORDE_TONO: Record<Tono, string> = {
  neutro: "border-pn-linea",
  ok: "border-pn-ok",
  aviso: "border-pn-aviso",
  peligro: "border-pn-peligro",
  info: "border-pn-info",
};
