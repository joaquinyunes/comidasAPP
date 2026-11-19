import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  permisos: ["*"] as string[],
  pagoFindMany: vi.fn(),
  clienteCount: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => ({ tenantId: "t1", usuarioId: "u1", sucursalId: null, roles: [], permisos: m.permisos }) }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    pago: { findMany: m.pagoFindMany },
    mesa: { findMany: async () => [{ estado: "libre" }, { estado: "ocupada" }] },
    pedido: { count: async () => 3 },
    producto: { count: async () => 10 },
    cliente: { count: m.clienteCount },
    stockPorSucursal: { findMany: async () => [] },
  },
}));

import { GET } from "@/app/api/dashboard/resumen/route";

const pedir = () => GET(new Request("http://x/api/dashboard/resumen") as never);

beforeEach(() => {
  m.permisos = ["*"];
  m.pagoFindMany.mockReset().mockResolvedValue([{ monto: 1000 }, { monto: 500 }]);
  m.clienteCount.mockReset().mockResolvedValue(7);
});

describe("GET /api/dashboard/resumen (M3)", () => {
  it("con reportes:leer devuelve ventas y clientes", async () => {
    m.permisos = ["reportes:leer"];
    const j = await (await pedir()).json();
    expect(j.soloOperativo).toBe(false);
    expect(j.ventasHoy).toBe(1500);
    expect(j.clientes).toBe(7);
  });

  it("un mozo (sin reportes) solo ve lo operativo: ni consulta ventas ni clientes", async () => {
    m.permisos = ["pedidos:leer", "mesas:leer"];
    const j = await (await pedir()).json();
    expect(j.soloOperativo).toBe(true);
    expect(j).toMatchObject({ mesasOcupadas: 1, mesasTotales: 2, pedidosActivos: 3, ventasHoy: 0, ventasMes: 0, ticketPromedio: 0, clientes: 0 });
    expect(m.pagoFindMany).not.toHaveBeenCalled();
    expect(m.clienteCount).not.toHaveBeenCalled();
  });
});
