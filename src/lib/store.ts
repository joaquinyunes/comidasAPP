import { create } from "zustand";
import type { Mesa, Pedido, PedidoItem, DashboardKPIs, MesaEstado } from "@/types";

// ============================================
// STORE DEL GEMELO DIGITAL
// ============================================

interface MesaStore {
  mesas: Mesa[];
  mesaSeleccionada: string | null;
  setMesas: (mesas: Mesa[]) => void;
  actualizarMesa: (mesaId: string, estado: MesaEstado) => void;
  seleccionarMesa: (mesaId: string | null) => void;
  getMesaById: (mesaId: string) => Mesa | undefined;
}

export const useMesaStore = create<MesaStore>((set, get) => ({
  mesas: [],
  mesaSeleccionada: null,

  setMesas: (mesas) => set({ mesas }),

  actualizarMesa: (mesaId, estado) =>
    set((state) => ({
      mesas: state.mesas.map((m) =>
        m.id === mesaId ? { ...m, estado } : m
      ),
    })),

  seleccionarMesa: (mesaId) => set({ mesaSeleccionada: mesaId }),

  getMesaById: (mesaId) => get().mesas.find((m) => m.id === mesaId),
}));

// ============================================
// STORE DE PEDIDOS (KDS)
// ============================================

interface PedidoStore {
  pedidos: Pedido[];
  setPedidos: (pedidos: Pedido[]) => void;
  agregarPedido: (pedido: Pedido) => void;
  actualizarEstadoItem: (pedidoId: string, itemId: string, estado: PedidoItem["estado"]) => void;
  actualizarEstadoPedido: (pedidoId: string, estado: Pedido["estado"]) => void;
}

export const usePedidoStore = create<PedidoStore>((set) => ({
  pedidos: [],

  setPedidos: (pedidos) => set({ pedidos }),

  agregarPedido: (pedido) =>
    set((state) => ({
      pedidos: [pedido, ...state.pedidos],
    })),

  actualizarEstadoItem: (pedidoId, itemId, estado) =>
    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === pedidoId
          ? {
              ...p,
              items: p.items.map((item) =>
                item.id === itemId ? { ...item, estado } : item
              ),
            }
          : p
      ),
    })),

  actualizarEstadoPedido: (pedidoId, estado) =>
    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === pedidoId ? { ...p, estado } : p
      ),
    })),
}));

// ============================================
// STORE DEL DASHBOARD
// ============================================

interface DashboardStore {
  kpis: DashboardKPIs;
  setKPIs: (kpis: DashboardKPIs) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  kpis: {
    ventasHoy: 0,
    ventasAyer: 0,
    ticketPromedio: 0,
    mesasOcupadas: 0,
    mesasTotales: 0,
    pedidosActivos: 0,
    clientesHoy: 0,
    stockCritico: 0,
  },
  setKPIs: (kpis) => set({ kpis }),
}));
