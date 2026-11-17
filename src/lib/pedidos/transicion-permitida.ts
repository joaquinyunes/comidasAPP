// Quién puede llevar un pedido a ciertos estados desde PUT /api/pedidos/[id].
// - «pagado» solo lo deja un cobro real (POST /api/pagos o el webhook de Mercado Pago).
// - «cerrado» y «cancelado» (cambian la plata del día) piden permiso de cobro o de baja de pedidos.

import { tienePermiso } from "@/lib/panel/permisos";

export type VeredictoTransicion = { ok: true } | { ok: false; status: 403 | 409; error: string };

export function transicionPermitida(estadoNuevo: string | undefined, permisos: string[]): VeredictoTransicion {
  if (estadoNuevo === "pagado") {
    return { ok: false, status: 409, error: "Un pedido pasa a «pagado» solo cuando se registra el cobro (/api/pagos)." };
  }
  if (estadoNuevo === "cerrado" || estadoNuevo === "cancelado") {
    if (tienePermiso(permisos, "pedidos:eliminar") || tienePermiso(permisos, "pagos:crear")) return { ok: true };
    return { ok: false, status: 403, error: "No tenés permiso para cerrar o cancelar pedidos." };
  }
  return { ok: true };
}
