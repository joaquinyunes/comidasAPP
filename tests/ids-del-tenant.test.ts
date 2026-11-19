import { describe, it, expect, vi, beforeEach } from "vitest";

const T = "11111111-1111-4111-8111-111111111111";
const SUC = "22222222-2222-4222-8222-222222222222";
const PROV = "33333333-3333-4333-8333-333333333333";
const ING = "44444444-4444-4444-8444-444444444444";

const m = vi.hoisted(() => ({
  sucursal: null as unknown,
  proveedor: null as unknown,
  ingredientesPropios: 1,
  reservaCreate: vi.fn(),
  ingredienteCreate: vi.fn(),
  ordenCreate: vi.fn(),
  where: [] as unknown[],
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => ({ tenantId: "11111111-1111-4111-8111-111111111111", usuarioId: "u1", sucursalId: null, roles: [], permisos: ["*"] }) }));
vi.mock("@/lib/prisma", () => {
  const f = (campo: "sucursal" | "proveedor") => async (a: { where: unknown }) => (m.where.push({ [campo]: a.where }), m[campo]);
  return {
    prisma: {
      sucursal: { findFirst: f("sucursal") },
      proveedor: { findFirst: f("proveedor") },
      ingrediente: { count: async (a: { where: unknown }) => (m.where.push({ ingredientes: a.where }), m.ingredientesPropios), create: m.ingredienteCreate },
      mesa: { findFirst: async () => ({ id: "x", capacidad: 10 }) },
      cliente: { findFirst: async () => ({ id: "c1" }), create: async () => ({ id: "c1" }) },
      reserva: { create: m.reservaCreate, findFirst: async () => null },
      ordenCompra: { create: m.ordenCreate },
      stockPorSucursal: { upsert: async () => ({}) },
      auditLog: { create: async () => ({}) },
    },
  };
});

import { POST as crearReserva } from "@/app/api/reservas/route";
import { POST as crearIngrediente } from "@/app/api/inventario/route";
import { POST as crearOrden } from "@/app/api/compras/ordenes/route";

const req = (body: object) => new Request("http://x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never;
const reserva = { clienteNombre: "Ana", clienteTelefono: "11223344", fecha: "2026-12-01", hora: "21:00", cantidadPersonas: 2, sucursalId: SUC };
const ingrediente = { ingrediente: { nombre: "Harina", unidadMedida: "kg", proveedorId: PROV }, stockInicial: { cantidad: 5 }, sucursalId: SUC };
const orden = { proveedorId: PROV, sucursalId: SUC, items: [{ ingredienteId: ING, cantidad: 1, precioUnitario: 10 }] };

beforeEach(() => {
  m.sucursal = { id: SUC };
  m.proveedor = { id: PROV };
  m.ingredientesPropios = 1;
  m.where = [];
  [m.reservaCreate, m.ingredienteCreate, m.ordenCreate].forEach((f) => f.mockReset().mockResolvedValue({ id: "nuevo", items: [] }));
});

describe("ids que vienen del cliente se validan contra el restaurante (M7)", () => {
  it("reservas: una sucursal de otro restaurante → 404 y no crea la reserva", async () => {
    m.sucursal = null;
    expect((await crearReserva(req(reserva))).status).toBe(404);
    expect(m.reservaCreate).not.toHaveBeenCalled();
    expect(m.where).toContainEqual({ sucursal: { id: SUC, tenantId: T } });
  });
  it("reservas: sucursal propia → 201", async () => {
    expect((await crearReserva(req(reserva))).status).toBe(201);
  });

  it("inventario: sucursal ajena → 404 y no crea el ingrediente", async () => {
    m.sucursal = null;
    expect((await crearIngrediente(req(ingrediente))).status).toBe(404);
    expect(m.ingredienteCreate).not.toHaveBeenCalled();
  });
  it("inventario: proveedor ajeno → 404 y no crea el ingrediente", async () => {
    m.proveedor = null;
    expect((await crearIngrediente(req(ingrediente))).status).toBe(404);
    expect(m.ingredienteCreate).not.toHaveBeenCalled();
    expect(m.where).toContainEqual({ proveedor: { id: PROV, tenantId: T } });
  });
  it("inventario: todo propio → 201", async () => {
    expect((await crearIngrediente(req(ingrediente))).status).toBe(201);
  });

  it("compras: un ingrediente de otro restaurante en los ítems → 404 y no crea la orden", async () => {
    m.ingredientesPropios = 0;
    expect((await crearOrden(req(orden))).status).toBe(404);
    expect(m.ordenCreate).not.toHaveBeenCalled();
    expect(m.where).toContainEqual({ ingredientes: { id: { in: [ING] }, tenantId: T } });
  });
  it("compras: todo propio → 201", async () => {
    expect((await crearOrden(req(orden))).status).toBe(201);
  });
});
