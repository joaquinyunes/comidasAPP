import type { Tono } from "../tonos";
import type { ControlApi, ResumenApi } from "./tipos";

export interface Alerta {
  id: string;
  tono: Tono;
  titulo: string;
  detalle: string;
  href: string;
  accion: string;
}

const DEMORA_ALTA_MIN = 15;

// Convierte los números del turno en cosas concretas para hacer.
// Solo devuelve lo que requiere atención; si todo está bien, no hay alertas.
export function armarAlertas(r: ResumenApi | null, c: ControlApi | null): Alerta[] {
  const alertas: Alerta[] = [];

  if (c && c.mesasDesatendidas.length > 0) {
    const mesas = c.mesasDesatendidas.map((m) => `Mesa ${m}`).join(", ");
    alertas.push({
      id: "mesas-desatendidas",
      tono: "peligro",
      titulo: `${c.mesasDesatendidas.length === 1 ? "Una mesa lleva" : `${c.mesasDesatendidas.length} mesas llevan`} más de 15 min sin atención`,
      detalle: mesas,
      href: "/dashboard/mozo",
      accion: "Ver salón",
    });
  }

  if (r && r.stockCritico > 0) {
    alertas.push({
      id: "stock-critico",
      tono: "peligro",
      titulo: `${r.stockCritico} ${r.stockCritico === 1 ? "ingrediente está" : "ingredientes están"} por agotarse`,
      detalle: "Por debajo de la mitad del mínimo configurado.",
      href: "/dashboard/inventario",
      accion: "Ver inventario",
    });
  }

  if (c && c.tiempoPromedioServicioMin > DEMORA_ALTA_MIN) {
    alertas.push({
      id: "demora-cocina",
      tono: "aviso",
      titulo: `La cocina tarda ${c.tiempoPromedioServicioMin} min por plato en promedio`,
      detalle: "Supera los 15 min en los últimos 30 días.",
      href: "/dashboard/cocina",
      accion: "Ver cocina",
    });
  }

  if (c && c.platosDevueltos > 0) {
    const motivos = Object.entries(c.porMotivo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([m, n]) => `${m} (${n})`)
      .join(", ");
    alertas.push({
      id: "platos-devueltos",
      tono: "aviso",
      titulo: `${c.platosDevueltos} ${c.platosDevueltos === 1 ? "plato anulado" : "platos anulados"} en 30 días`,
      detalle: motivos || "Sin motivo cargado.",
      href: "/dashboard/dueno",
      accion: "Ver detalle",
    });
  }

  return alertas;
}
