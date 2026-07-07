// ============================================
// API CLIENT
// ============================================

const API_BASE = "/api";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

// ============================================
// MESAS
// ============================================

export const mesasAPI = {
  listar: (sucursalId?: string) =>
    fetchAPI<any[]>(`/mesas${sucursalId ? `?sucursalId=${sucursalId}` : ""}`),

  obtener: (id: string) => fetchAPI<any>(`/mesas/${id}`),

  cambiarEstado: (id: string, estado: string) =>
    fetchAPI<any>(`/mesas/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),

  plano: (sucursalId: string) =>
    fetchAPI<any[]>(`/mesas/plano?sucursalId=${sucursalId}`),
};

// ============================================
// PEDIDOS
// ============================================

export const pedidosAPI = {
  listar: (filters?: { mesaId?: string; estado?: string; sucursalId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.mesaId) params.set("mesaId", filters.mesaId);
    if (filters?.estado) params.set("estado", filters.estado);
    if (filters?.sucursalId) params.set("sucursalId", filters.sucursalId);
    return fetchAPI<any[]>(`/pedidos?${params.toString()}`);
  },

  obtener: (id: string) => fetchAPI<any>(`/pedidos/${id}`),

  crear: (data: { mesaId: string; items: { productoId: string; cantidad: number; notas?: string }[]; notas?: string }) =>
    fetchAPI<any>("/pedidos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cambiarEstado: (id: string, estado: string) =>
    fetchAPI<any>(`/pedidos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),

  cambiarEstadoItem: (pedidoId: string, itemId: string, estado: string) =>
    fetchAPI<any>(`/pedidos/${pedidoId}/items/${itemId}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),

  timeline: (id: string) => fetchAPI<any[]>(`/pedidos/${id}/timeline`),
};

// ============================================
// PRODUCTOS / MENÚ
// ============================================

export const productosAPI = {
  listar: (categoriaId?: string) =>
    fetchAPI<any[]>(`/productos${categoriaId ? `?categoriaId=${categoriaId}` : ""}`),

  obtener: (id: string) => fetchAPI<any>(`/productos/${id}`),

  publico: (tenantSlug: string) =>
    fetchAPI<any[]>(`/productos/publico?tenant=${tenantSlug}`),
};

// ============================================
// DASHBOARD
// ============================================

export const dashboardAPI = {
  resumen: () => fetchAPI<any>("/dashboard/resumen"),
  ventas: (desde: string, hasta: string) =>
    fetchAPI<any>(`/dashboard/ventas?desde=${desde}&hasta=${hasta}`),
  topProductos: () => fetchAPI<any[]>("/dashboard/top-productos"),
  horasPico: () => fetchAPI<any[]>("/dashboard/horas-pico"),
};

// ============================================
// RESERVAS
// ============================================

export const reservasAPI = {
  listar: (fecha?: string) =>
    fetchAPI<any[]>(`/reservas${fecha ? `?fecha=${fecha}` : ""}`),

  disponibilidad: (fecha: string, hora: string, personas: number) =>
    fetchAPI<any[]>(`/reservas/disponibilidad?fecha=${fecha}&hora=${hora}&personas=${personas}`),

  crear: (data: any) =>
    fetchAPI<any>("/reservas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cambiarEstado: (id: string, estado: string) =>
    fetchAPI<any>(`/reservas/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),
};

// ============================================
// CLIENTES
// ============================================

export const clientesAPI = {
  listar: () => fetchAPI<any[]>("/clientes"),
  obtener: (id: string) => fetchAPI<any>(`/clientes/${id}`),
  historial: (id: string) => fetchAPI<any[]>(`/clientes/${id}/historial`),
  puntos: (id: string) => fetchAPI<any>(`/clientes/${id}/puntos`),
};
