// Traduce lo que dice el encargado ("llegó mercadería", "conté 12") al
// movimiento que entiende el backend.

export type AccionStock = "llego" | "uso" | "tiro" | "conteo";

export const ACCIONES_STOCK: { valor: AccionStock; etiqueta: string }[] = [
  { valor: "llego", etiqueta: "Llegó mercadería" },
  { valor: "uso", etiqueta: "Se usó o sacó" },
  { valor: "tiro", etiqueta: "Se tiró o se rompió" },
  { valor: "conteo", etiqueta: "Corregir por conteo" },
];

export interface MovimientoBackend {
  tipo: "entrada" | "salida" | "merma" | "ajuste";
  cantidad: number;
}

// Para "conteo" la cantidad ingresada es lo que HAY, y se manda la diferencia.
// Devuelve null si el dato no sirve o si no cambia nada.
export function armarMovimiento(
  accion: AccionStock,
  cantidad: number,
  actual: number
): MovimientoBackend | null {
  if (!Number.isFinite(cantidad) || cantidad < 0) return null;

  switch (accion) {
    case "llego":
      return cantidad > 0 ? { tipo: "entrada", cantidad } : null;
    case "uso":
      return cantidad > 0 ? { tipo: "salida", cantidad } : null;
    case "tiro":
      return cantidad > 0 ? { tipo: "merma", cantidad } : null;
    case "conteo": {
      const diferencia = Math.round((cantidad - actual) * 1000) / 1000;
      return diferencia === 0 ? null : { tipo: "ajuste", cantidad: diferencia };
    }
  }
}
