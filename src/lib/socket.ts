"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// ============================================
// TIPOS
// ============================================

export type SocketEvent =
  | "pedido:nuevo"
  | "pedido:actualizado"
  | "pedido:estado_cambiado"
  | "mesa:actualizada"
  | "kds:pedido_listo"
  | "notificacion:nueva"
  | "caja:movimiento";

export interface SocketMessage {
  event: SocketEvent;
  data: unknown;
  timestamp: Date;
  tenantId: string;
}

// ============================================
// HOOK: useSocket
// ============================================

interface UseSocketOptions {
  tenantId: string;
  autoConnect?: boolean;
}

export function useSocket({ tenantId, autoConnect = true }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001", {
      auth: { tenantId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket conectado");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket desconectado");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🔌 Error de conexión:", error.message);
    });

    // Escuchar todos los eventos
    const events: SocketEvent[] = [
      "pedido:nuevo",
      "pedido:actualizado",
      "pedido:estado_cambiado",
      "mesa:actualizada",
      "kds:pedido_listo",
      "notificacion:nueva",
      "caja:movimiento",
    ];

    events.forEach((event) => {
      socket.on(event, (data) => {
        setLastMessage({
          event,
          data,
          timestamp: new Date(),
          tenantId,
        });
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [tenantId, autoConnect]);

  const emit = useCallback((event: SocketEvent, data: Record<string, unknown>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, { ...data, tenantId });
    }
  }, [tenantId]);

  const subscribe = useCallback((event: SocketEvent, callback: (data: unknown) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        socketRef.current?.off(event, callback);
      };
    }
    return () => {};
  }, []);

  return {
    isConnected,
    lastMessage,
    emit,
    subscribe,
    socket: socketRef.current,
  };
}

// ============================================
// HOOK: usePedidoRealtime
// ============================================

export function usePedidoRealtime(tenantId: string, onPedidoUpdate?: (data: unknown) => void) {
  const { subscribe, emit, isConnected } = useSocket({ tenantId });

  useEffect(() => {
    const unsubPedido = subscribe("pedido:nuevo", (data) => {
      console.log("📦 Nuevo pedido:", data);
      onPedidoUpdate?.(data);
    });

    const unsubEstado = subscribe("pedido:estado_cambiado", (data) => {
      console.log("📦 Estado cambiado:", data);
      onPedidoUpdate?.(data);
    });

    return () => {
      unsubPedido();
      unsubEstado();
    };
  }, [subscribe, onPedidoUpdate]);

  const actualizarEstado = useCallback((pedidoId: string, nuevoEstado: string) => {
    emit("pedido:actualizado", { pedidoId, estado: nuevoEstado });
  }, [emit]);

  return { isConnected, actualizarEstado };
}

// ============================================
// HOOK: useKDSRealtime
// ============================================

export function useKDSRealtime(tenantId: string, sector: "cocina" | "barra") {
  const { subscribe, emit, isConnected } = useSocket({ tenantId });
  const [pedidosEnCola, setPedidosEnCola] = useState<unknown[]>([]);

  useEffect(() => {
    const unsub = subscribe("pedido:nuevo", (data: unknown) => {
      const pedido = data as { sector?: string };
      if (pedido.sector === sector) {
        setPedidosEnCola((prev) => [...prev, data]);
      }
    });

    const unsubListo = subscribe("kds:pedido_listo", (data: unknown) => {
      setPedidosEnCola((prev) => prev.filter((p) => {
        const pedido = p as { id?: string };
        const listo = data as { pedidoId?: string };
        return pedido.id !== listo.pedidoId;
      }));
    });

    return () => {
      unsub();
      unsubListo();
    };
  }, [subscribe, sector]);

  const marcarListo = useCallback((pedidoId: string) => {
    emit("kds:pedido_listo", { pedidoId, sector });
  }, [emit, sector]);

  return { isConnected, pedidosEnCola, marcarListo };
}
