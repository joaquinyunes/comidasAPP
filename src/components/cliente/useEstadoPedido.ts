"use client";

import { useEffect, useState } from "react";

export interface EstadoPedido {
  pedidoId: string;
  estadoGeneral: string;
  mensaje: string;
  progreso: number;
  total: number;
  pagadoConsumo: number;
  saldoPendiente: number;
  pagos: number;
  pagado: boolean;
  puedePagar: boolean;
  sinApurar: string;
}

// Sondea el estado del pedido cada `intervaloMs`. Se detiene solo
// cuando el pedido queda pagado o cancelado.
export function useEstadoPedido(pedidoId: string | null, intervaloMs = 5000) {
  const [estado, setEstado] = useState<EstadoPedido | null>(null);

  useEffect(() => {
    if (!pedidoId) return;
    let vivo = true;

    async function consultar() {
      try {
        const res = await fetch(`/api/cliente/pedido/${pedidoId}/estado`);
        if (!res.ok) return;
        const json = await res.json();
        if (vivo && json.data) setEstado(json.data as EstadoPedido);
      } catch {
        // Silencioso: reintentamos en el próximo tick.
      }
    }

    consultar();
    const timer = setInterval(() => {
      setEstado((actual) => {
        if (actual && (actual.pagado || actual.estadoGeneral === "cancelado")) {
          clearInterval(timer);
          return actual;
        }
        consultar();
        return actual;
      });
    }, intervaloMs);

    return () => {
      vivo = false;
      clearInterval(timer);
    };
  }, [pedidoId, intervaloMs]);

  return estado;
}
