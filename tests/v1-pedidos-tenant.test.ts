import { describe, it, expect, vi, beforeEach } from "vitest";

const T = "11111111-1111-4111-8111-111111111111";
const MESA = "22222222-2222-4222-8222-222222222222";
const P1 = "33333333-3333-4333-8333-333333333333";
const P2 = "44444444-4444-4444-8444-444444444444";

const m = vi.hoisted(() => ({
  mesa: null as unknown,
  productos: [] as { id: string; precio: number }[],
  pedidoCreate: vi.fn(),
  where: [] as unknown[],
}));

vi.mock("@/lib/api-v1/validar-api-key", () => ({ validarAPIKey: async () => ({ tenantId: "11111111-1111-4111-8111-111111111111", scopes: ["pedidos:crear"] }) }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    mesa: { findFirst: async (a: { where: unknown }) => (m.where.push({ mesa: a.where }), m.mesa), update: async () => ({}) },
    producto: { findMany: async (a: { where: unknown }) => (m.where.push({ productos: a.where }), m.productos) },
    pedido: { create: m.pedidoCreate },
  },
}));

import { POST } from "@/app/api/v1/pedidos/route";

const pedir = (body: object) => POST(new Request("http://x/api/v1/pedidos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never);

beforeEach(() => {
  m.mesa = { id: MESA, sucursalId: "s1" };
  m.productos = [{ id: P1, precio: 100 }, { id: P2, precio: 50 }];
  m.where = [];
  m.pedidoCreate.mockReset().mockResolvedValue({ id: "ped", estado: "recibido", total: 250, items: [{}, {}] });
});

describe("POST /api/v1/pedidos (M8)", () => {
  it("busca la mesa y los productos SOLO dentro del restaurante de la clave", async () => {
    const res = await pedir({ mesaId: MESA, items: [{ productoId: P1, cantidad: 2 }, { productoId: P2, cantidad: 1 }] });
    expect(res.status).toBe(201);
    expect(m.where).toContainEqual({ mesa: { id: MESA, tenantId: T } });
    expect(m.where).toContainEqual({ productos: { id: { in: [P1, P2] }, tenantId: T } });
    expect(m.pedidoCreate.mock.calls[0][0].data.total).toBe(250);
  });

  it("una mesa de otro restaurante: 404", async () => {
    m.mesa = null;
    expect((await pedir({ mesaId: MESA, items: [{ productoId: P1, cantidad: 1 }] })).status).toBe(404);
    expect(m.pedidoCreate).not.toHaveBeenCalled();
  });

  it("si falta un producto (o es de otro restaurante): 400 y no crea un pedido a precio 0", async () => {
    m.productos = [{ id: P1, precio: 100 }];
    const res = await pedir({ mesaId: MESA, items: [{ productoId: P1, cantidad: 1 }, { productoId: P2, cantidad: 1 }] });
    expect(res.status).toBe(400);
    expect(m.pedidoCreate).not.toHaveBeenCalled();
  });
});
