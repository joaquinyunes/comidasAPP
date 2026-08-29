import { describe, it, expect, vi, beforeAll } from "vitest";
import { NextRequest } from "next/server";

// --- Mock de Prisma: cliente genérico que no toca la BD real ---
vi.mock("@/lib/prisma", () => {
  const makeModel = () =>
    new Proxy(
      {},
      {
        get(_t, method) {
          return (...args: unknown[]) => {
            const arg = args[0] as { data?: unknown; create?: unknown } | undefined;
            switch (method) {
              case "count":
                return Promise.resolve(0);
              case "aggregate":
                return Promise.resolve({ _count: { _all: 0 }, _sum: { total: 0 } });
              case "findMany":
                return Promise.resolve([]);
              case "findFirst":
                return Promise.resolve(null);
              case "findUnique":
                return Promise.resolve(null);
              case "create":
                return Promise.resolve(arg?.data ?? {});
              case "update":
                return Promise.resolve(arg?.data ?? {});
              case "upsert":
                return Promise.resolve(arg?.create ?? {});
              case "createMany":
                return Promise.resolve({ count: (arg?.data as unknown[] | undefined)?.length ?? 0 });
              case "delete":
                return Promise.resolve({});
              case "deleteMany":
                return Promise.resolve({ count: 0 });
              case "updateMany":
                return Promise.resolve({ count: 0 });
              case "groupBy":
                return Promise.resolve([]);
              default:
                return Promise.resolve({});
            }
          };
        },
      }
    );
  return { prisma: new Proxy({}, { get: () => makeModel() }) };
});

// --- Mock de auth: devuelve contexto si hay header Authorization ---
vi.mock("@/lib/auth-context", () => ({
  getTenantContext: (req: NextRequest) => {
    const h = req?.headers?.get?.("Authorization");
    if (h) {
      return Promise.resolve({
        tenantId: "tenant-test",
        sucursalId: "sucursal-test",
        usuarioId: "usuario-test",
        roles: ["admin"],
        permisos: ["*"],
      });
    }
    return Promise.resolve(null);
  },
  requirePermission: () => () => null,
}));

const UUID = "550e8400-e29b-41d4-a716-446655440000";

function req(url: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}) {
  const headers: Record<string, string> = {};
  if (opts.auth) headers["Authorization"] = "Bearer token";
  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method: opts.method ?? "GET",
    headers,
  };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  return new NextRequest(url, init);
}

// ============================================================
// SMOKE: guard de autenticación + validación en los POST
// ============================================================
describe("Smoke Bloque 2: guards y validación por micro-fase", () => {
  const GET_ROUTES = [
    "personal/checklists",
    "personal/checklists/ejecuciones",
    "mesas",
    "pedidos",
    "reservas",
    "inventario",
    "inventario/ingredientes",
    "compras/proveedores",
    "compras/ordenes",
    "rrhh/empleados",
    "rrhh/turnos",
    "rrhh/asistencia",
    "marketing/campanas",
    "marketing/cupones",
    "cocina/comandas",
    "cocina/estaciones",
    "cocina/tiempos-coccion",
    "mozo/mapa-semaforo",
    "mozo/cuenta",
    "mozo/disponibilidad",
    "mozo/alergias",
    "mozo/historial-mesa",
    "cliente/menu",
    "dueno/control-operativo",
    "delivery/seguimiento",
    "fidelizacion/clientes-recurrentes",
    "fidelizacion/historial-mesa",
    "fidelizacion/logistica",
    "fidelizacion/sugerencias-mozo",
    "feedback/resumen",
    "reportes/resumen",
    "audit",
    "ia/prediccion-ventas",
    "ia/prediccion-stock",
    "dashboard/resumen",
    "pagos",
  ];

  for (const route of GET_ROUTES) {
    it(`GET /api/${route} ejecuta handler con auth (no 401)`, async () => {
      const mod = await import(`@/app/api/${route}/route`);
      if (typeof mod.GET !== "function") return;
      const res = await mod.GET(req(`http://localhost/api/${route}`, { auth: true }));
      expect(res.status).not.toBe(401);
    });
  }

  const POST_ROUTES: { route: string; invalid: unknown }[] = [
    { route: "personal/checklists", invalid: {} },
    { route: "personal/fichaje", invalid: { tipo: "X" } },
    { route: "compras/proveedores", invalid: { nombre: 123 } },
    { route: "compras/ordenes", invalid: { items: [] } },
    { route: "rrhh/empleados", invalid: {} },
    { route: "marketing/cupones", invalid: { codigo: "min" } },
    { route: "reservas", invalid: { clienteNombre: "" } },
    { route: "fidelizacion/visitas", invalid: { mesaId: "no-uuid" } },
    { route: "fidelizacion/reconocimiento", invalid: { mesaId: UUID } },
    { route: "delivery/asignar", invalid: {} },
    { route: "cliente/pedido", invalid: { mesaId: UUID, items: [] } },
  ];

  for (const { route, invalid } of POST_ROUTES) {
    it(`POST /api/${route} valida input (400/422 con body inválido)`, async () => {
      const mod = await import(`@/app/api/${route}/route`);
      if (typeof mod.POST !== "function") return;
      const res = await mod.POST(
        req(`http://localhost/api/${route}`, { method: "POST", body: invalid, auth: true })
      );
      expect([400, 422]).toContain(res.status);
    });
  }
});

// ============================================================
// PRUEBAS PROFUNDAS: respuestas reales con mock de Prisma
// ============================================================
describe("Pruebas profundas (respuesta real con datos mock)", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-for-testing-min-32-chars-xxxx";
  });


  it("POST /api/cliente/pedido: body valido pasa validacion y llega a logica de negocio", async () => {
    const { POST } = await import("@/app/api/cliente/pedido/route");
    const res = await POST(
      req("http://localhost/api/cliente/pedido", {
        method: "POST",
        body: { mesaId: UUID, items: [{ productoId: UUID, cantidad: 1 }] },
      })
    );
    expect([200, 201, 404, 409]).toContain(res.status);
  });

  it("POST /api/cliente/pedido 400/422 con body invalido", async () => {
    const { POST } = await import("@/app/api/cliente/pedido/route");
    const res = await POST(
      req("http://localhost/api/cliente/pedido", {
        method: "POST",
        body: { mesaId: UUID, items: [] },
      })
    );
    expect([400, 422]).toContain(res.status);
  });
});
