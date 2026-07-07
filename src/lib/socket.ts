"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// ============================================
// Hook para WebSocket
// ============================================

let socket: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io(window.location.origin, {
        path: "/api/socketio",
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("🔌 WebSocket conectado");
      });

      socket.on("disconnect", () => {
        console.log("❌ WebSocket desconectado");
      });
    }

    socketRef.current = socket;

    return () => {
      // No desconectar al desmontar componentes
    };
  }, []);

  const joinTenant = useCallback((tenantId: string) => {
    socketRef.current?.emit("join:tenant", tenantId);
  }, []);

  const joinCocina = useCallback((sucursalId: string) => {
    socketRef.current?.emit("join:cocina", sucursalId);
  }, []);

  const joinBarra = useCallback((sucursalId: string) => {
    socketRef.current?.emit("join:barra", sucursalId);
  }, []);

  const cambiarEstadoMesa = useCallback(
    (mesaId: string, estado: string, tenantId: string) => {
      socketRef.current?.emit("mesa:cambiar_estado", { mesaId, estado, tenantId });
    },
    []
  );

  const nuevoPedido = useCallback((pedido: any) => {
    socketRef.current?.emit("pedido:nuevo", pedido);
  }, []);

  const itemListo = useCallback(
    (pedidoId: string, itemId: string, tenantId: string) => {
      socketRef.current?.emit("pedido:item_listo", { pedidoId, itemId, tenantId });
    },
    []
  );

  const onMesaEstadoCambiado = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("mesa:estado_cambiado", callback);
    return () => {
      socketRef.current?.off("mesa:estado_cambiado", callback);
    };
  }, []);

  const onPedidoNuevo = useCallback((callback: (pedido: any) => void) => {
    socketRef.current?.on("pedido:nuevo", callback);
    return () => {
      socketRef.current?.off("pedido:nuevo", callback);
    };
  }, []);

  const onItemListo = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("pedido:item_listo", callback);
    return () => {
      socketRef.current?.off("pedido:item_listo", callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    joinTenant,
    joinCocina,
    joinBarra,
    cambiarEstadoMesa,
    nuevoPedido,
    itemListo,
    onMesaEstadoCambiado,
    onPedidoNuevo,
    onItemListo,
  };
}
