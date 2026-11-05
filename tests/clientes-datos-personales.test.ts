import { describe, it, expect, vi, beforeEach } from "vitest";

const T = "11111111-1111-4111-8111-111111111111";
const C = "22222222-2222-4222-8222-222222222222";

const m = vi.hoisted(() => ({
  ctx: null as unknown,
  clienteFindFirst: vi.fn(),
  tx: [] as unknown[],
  audit: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => m.ctx }));
vi.mock("@/lib/prisma", () => {
  const op = (nombre: string) => (args: unknown) => ({ nombre, args });
  return {
    prisma: {
      cliente: { findFirst: m.clienteFindFirst, update: op("cliente.update") },
      clienteFavorito: { deleteMany: op("favoritos.deleteMany") },
      pedido: { updateMany: op("pedido.updateMany") },
      reserva: { updateMany: op("reserva.updateMany") },
      auditLog: { create: async (a: unknown) => (m.audit(a), {}) },
      $transaction: async (ops: unknown[]) => ((m.tx = ops), []),
    },
  };
});

import { GET, DELETE } from "@/app/api/clientes/[id]/datos/route";

const llamar = (fn: (r: never, c: { params: Promise<{ id: string }> }) => Promise<Response>, id = C) =>
  fn(new Request("http://x/api/clientes/" + id + "/datos") as never, { params: Promise.resolve({ id }) });

beforeEach(() => {
  m.ctx = { tenantId: T, usuarioId: "u1", roles: [], permisos: ["*"] };
  m.clienteFindFirst.mockReset().mockResolvedValue({ id: C, tenantId: T, nombre: "Ana", email: "a@b.com", pedidos: [], reservas: [], favoritos: [], puntosHistorial: [] });
  m.audit.mockReset();
  m.tx = [];
});

describe("datos personales del cliente (Ley 25.326)", () => {
  it("exporta los datos del cliente del propio restaurante y lo audita", async () => {
    const res = await llamar(GET);
    expect(res.status).toBe(200);
    expect(m.clienteFindFirst.mock.calls[0][0].where).toEqual({ id: C, tenantId: T });
    const json = await res.json();
    expect(json.cliente.email).toBe("a@b.com");
    expect(json.cliente.tenantId).toBeUndefined();
    expect(m.audit.mock.calls[0][0].data).toMatchObject({ accion: "EXPORTAR_DATOS", entidadId: C, usuarioId: "u1" });
  });

  it("anonimiza: borra contacto en cliente, pedidos y reservas, y lo audita", async () => {
    const res = await llamar(DELETE);
    expect(res.status).toBe(200);
    const nombres = (m.tx as { nombre: string }[]).map((o) => o.nombre);
    expect(nombres).toEqual(["cliente.update", "favoritos.deleteMany", "pedido.updateMany", "reserva.updateMany"]);
    const cliente = (m.tx[0] as { args: { data: Record<string, unknown> } }).args.data;
    expect(cliente).toMatchObject({ nombre: "Cliente eliminado", email: null, telefono: null, optInMarketing: false });
    expect(cliente.deletedAt).toBeInstanceOf(Date);
    expect(m.audit.mock.calls[0][0].data).toMatchObject({ accion: "ANONIMIZAR_CLIENTE" });
  });

  it("sin el permiso de borrado no anonimiza", async () => {
    m.ctx = { tenantId: T, usuarioId: "u2", roles: [], permisos: ["clientes:leer"] };
    expect((await llamar(DELETE)).status).toBe(403);
    expect(m.tx).toEqual([]);
  });

  it("cliente de otro restaurante o inexistente: 404", async () => {
    m.clienteFindFirst.mockResolvedValue(null);
    expect((await llamar(GET)).status).toBe(404);
    expect((await llamar(DELETE)).status).toBe(404);
  });

  it("id que no es uuid: 400; sin sesión: 401", async () => {
    expect((await llamar(GET, "no-es-uuid")).status).toBe(400);
    m.ctx = null;
    expect((await llamar(GET)).status).toBe(401);
  });
});
