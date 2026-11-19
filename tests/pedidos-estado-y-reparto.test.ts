import { describe, it, expect, vi, beforeEach } from "vitest";

const T = "11111111-1111-4111-8111-111111111111";
const P = "22222222-2222-4222-8222-222222222222";
const EMP = "33333333-3333-4333-8333-333333333333";
const ZONA = "44444444-4444-4444-8444-444444444444";

const m = vi.hoisted(() => ({
  permisos: ["*"] as string[],
  pedido: null as null | { id: string; tenantId: string; estado: string; mesaId: string | null; total: number },
  empleado: null as unknown,
  zona: null as unknown,
  pedidoUpdate: vi.fn(),
  asignacionCreate: vi.fn(),
  eventoCreate: vi.fn(),
  itemUpdate: vi.fn(),
  where: [] as unknown[],
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => ({ tenantId: "11111111-1111-4111-8111-111111111111", usuarioId: "u1", sucursalId: null, roles: [], permisos: m.permisos }) }));
vi.mock("@/lib/pedidos/sincronizar-estado", () => ({ sincronizarEstadoPedido: async () => {} }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    pedido: { findFirst: async (a: { where: unknown }) => (m.where.push(a.where), m.pedido), update: m.pedidoUpdate },
    pedidoEvento: { create: m.eventoCreate },
    pedidoItem: { update: m.itemUpdate },
    mesa: { update: async () => ({}) },
    auditLog: { create: async () => ({}) },
    empleado: { findFirst: async (a: { where: unknown }) => (m.where.push(a.where), m.empleado) },
    zonaReparto: { findFirst: async (a: { where: unknown }) => (m.where.push(a.where), m.zona) },
    asignacionReparto: { create: m.asignacionCreate },
  },
}));

import { PUT } from "@/app/api/pedidos/[id]/route";
import { POST as asignar } from "@/app/api/delivery/asignar/route";

const put = (body: object) => PUT(new Request("http://x", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never, { params: Promise.resolve({ id: P }) });
const asignarReq = (body: object) => asignar(new Request("http://x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never);

beforeEach(() => {
  m.permisos = ["*"];
  m.pedido = { id: P, tenantId: T, estado: "recibido", mesaId: null, total: 100 };
  m.empleado = { id: EMP };
  m.zona = { id: ZONA };
  m.where = [];
  [m.pedidoUpdate, m.asignacionCreate, m.eventoCreate, m.itemUpdate].forEach((f) => f.mockReset().mockResolvedValue({}));
});

describe("PUT /api/pedidos/[id] (M6)", () => {
  it.each(["pagado", "cancelado"])("un pedido %s no cambia de estado: 409", async (estado) => {
    m.pedido!.estado = estado;
    const res = await put({ estado: "listo" });
    expect(res.status).toBe(409);
    expect(m.pedidoUpdate).not.toHaveBeenCalled();
  });

  it("tampoco se le tocan los ítems a un pedido pagado", async () => {
    m.pedido!.estado = "pagado";
    const res = await put({ itemId: "55555555-5555-4555-8555-555555555555", itemEstado: "listo" });
    expect(res.status).toBe(409);
    expect(m.itemUpdate).not.toHaveBeenCalled();
  });

  it("un pedido abierto sigue funcionando", async () => {
    expect((await put({ estado: "listo" })).status).toBe(200);
    expect(m.pedidoUpdate).toHaveBeenCalledOnce();
  });

  it("B9: un pedido en $0 puede pasar a pagado; con saldo, no", async () => {
    m.pedido!.total = 0;
    expect((await put({ estado: "pagado" })).status).toBe(200);
    m.pedido!.total = 100;
    expect((await put({ estado: "pagado" })).status).toBe(409);
  });
});

describe("POST /api/delivery/asignar (M6, M7)", () => {
  const body = { pedidoId: P, empleadoId: EMP, zonaId: ZONA };

  it("asigna con empleado y zona del mismo restaurante, validados con tenantId", async () => {
    const res = await asignarReq(body);
    expect(res.status).toBe(201);
    expect(m.where).toEqual(expect.arrayContaining([{ id: EMP, tenantId: T }, { id: ZONA, tenantId: T }]));
  });

  it("un empleado de otro restaurante: 404 y no asigna", async () => {
    m.empleado = null;
    expect((await asignarReq(body)).status).toBe(404);
    expect(m.asignacionCreate).not.toHaveBeenCalled();
  });

  it("una zona de otro restaurante: 404", async () => {
    m.zona = null;
    expect((await asignarReq(body)).status).toBe(404);
    expect(m.asignacionCreate).not.toHaveBeenCalled();
  });

  it.each(["pagado", "cancelado"])("no se asigna reparto a un pedido %s: 409", async (estado) => {
    m.pedido!.estado = estado;
    expect((await asignarReq(body)).status).toBe(409);
    expect(m.asignacionCreate).not.toHaveBeenCalled();
  });
});
