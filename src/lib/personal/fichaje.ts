// Qué puede hacer cada persona del plantel según cómo está hoy.
// Una sola acción principal por persona: un toque y listo.

export type TipoFichaje = "ENTRADA" | "SALIDA" | "BREAK_IN" | "BREAK_OUT";

export interface AccionFichaje {
  tipo: TipoFichaje;
  etiqueta: string;
  principal: boolean;
}

export function accionesDeFichaje(estado: string): AccionFichaje[] {
  switch (estado) {
    case "trabajando":
      return [
        { tipo: "SALIDA", etiqueta: "Salida", principal: true },
        { tipo: "BREAK_IN", etiqueta: "Descanso", principal: false },
      ];
    case "en_break":
      return [{ tipo: "BREAK_OUT", etiqueta: "Volvió del descanso", principal: true }];
    case "finalizo":
      return [];
    case "con_turno":
    case "sin_fichar":
    default:
      return [{ tipo: "ENTRADA", etiqueta: "Entrada", principal: true }];
  }
}

export const ETIQUETA_FICHAJE: Record<string, string> = {
  trabajando: "Trabajando",
  en_break: "En descanso",
  con_turno: "Tiene turno",
  sin_fichar: "Sin fichar",
  finalizo: "Terminó",
};

export const TONO_FICHAJE: Record<string, "ok" | "aviso" | "info" | "neutro"> = {
  trabajando: "ok",
  en_break: "aviso",
  con_turno: "info",
  sin_fichar: "neutro",
  finalizo: "neutro",
};

// Cuenta cuántos hay en cada situación, para el resumen de arriba.
export function resumirPlantel(estados: string[]): { trabajando: number; enDescanso: number; faltan: number } {
  return {
    trabajando: estados.filter((e) => e === "trabajando").length,
    enDescanso: estados.filter((e) => e === "en_break").length,
    faltan: estados.filter((e) => e === "con_turno" || e === "sin_fichar").length,
  };
}
