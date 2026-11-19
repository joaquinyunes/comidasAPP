// Quién puede llevar un pedido a ciertos estados desde PUT /api/pedidos/[id].
// - «pagado» solo lo deja un cobro real (POST /api/pagos o el webhook de Mercado Pago); única excepción:
//   un pedido en $0 (cupón del 100 %) pasa a «pagado» sin cobro, porque no hay nada que cobrar.
// - Un pedido ya «pagado» o «cancelado» no vuelve a cambiar de estado (ni se le tocan los ítems).
// - «cerrado» y «cancelado» (cambian la plata del día) piden permiso de cobro o de baja de pedidos.

import { tienePermiso } from "@/lib/panel/permisos";

export type VeredictoTransicion = { ok: true } | { ok: false; status: 403 | 409; error: string };

export function transicionPermitida(estadoNuevo: string | undefined, permisos: string[], total?: number): VeredictoTransicion {
  if (estadoNuevo === "pagado") {
    if (total !== undefined && total <= 0) return { ok: true };
    return { ok: false, status: 409, error: "Un pedido pasa a «pagado» solo cuando se registra el cobro (/api/pagos)." };
  }
  if (estadoNuevo === "cerrado" || estadoNuevo === "cancelado") {
    if (tienePermiso(permisos, "pedidos:eliminar") || tienePermiso(permisos, "pagos:crear")) return { ok: true };
    return { ok: false, status: 403, error: "No tenés permiso para cerrar o cancelar pedidos." };
  }
  return { ok: true };
}

const ESTADOS_FINALES = ["pagado", "cancelado"];

// Veredicto completo para un cambio sobre un pedido existente (PUT /api/pedidos/[id], asignar reparto…).
export function puedeTransicionarPedido(a: { actual: string; nuevo: string | undefined; total: number; permisos: string[] }): VeredictoTransicion {
  if (ESTADOS_FINALES.includes(a.actual)) {
    return { ok: false, status: 409, error: `El pedido está ${a.actual}: ya no se puede modificar.` };
  }
  return transicionPermitida(a.nuevo, a.permisos, a.total);
}
