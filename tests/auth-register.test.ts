import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const T = "11111111-1111-4111-8111-111111111111";
const ROL = "22222222-2222-4222-8222-222222222222";
const m = vi.hoisted(() => ({
  usuarios: 0,
  ctx: null as unknown,
  rolDelTenant: true,
  crear: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => m.ctx }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    usuario: { count: async () => m.usuarios, findFirst: async () => null, create: m.crear },
    tenant: { findUnique: async () => ({ id: T }) },
    rol: { findFirst: async ({ where }: { where: { id: string; tenantId: string } }) => (m.rolDelTenant && where.tenantId === T ? { id: where.id } : null) },
  },
}));

import { POST } from "@/app/api/auth/register/route";

const registrar = (extra: object = {}, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://x/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({ email: "n@x.com", password: "una-clave-larga-123", nombre: "Nuevo", tenantId: T, ...extra }),
    }) as never
  );

beforeEach(() => {
  m.usuarios = 3;
  m.ctx = { tenantId: T, usuarioId: "u", roles: [], permisos: ["*"] };
  m.rolDelTenant = true;
  m.crear.mockReset().mockResolvedValue({ id: "n", email: "n@x.com", nombre: "Nuevo" });
  vi.stubEnv("BOOTSTRAP_TOKEN", "token-de-instalacion-largo");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/auth/register", () => {
  it("un admin del restaurante crea usuarios con un rol DEL MISMO restaurante", async () => {
    expect((await registrar({ rolId: ROL })).status).toBe(201);
  });
  it("un rol que no es de ese restaurante se rechaza (no se puede colgar un rol ajeno)", async () => {
    m.rolDelTenant = false;
    const res = await registrar({ rolId: ROL });
    expect(res.status).toBe(400);
    expect(m.crear).not.toHaveBeenCalled();
  });
  it("rolId que no es uuid: 400", async () => {
    expect((await registrar({ rolId: "admin" })).status).toBe(400);
  });
  it("quien no es admin no crea usuarios", async () => {
    m.ctx = { tenantId: T, usuarioId: "u", roles: [], permisos: ["pedidos:leer"] };
    expect((await registrar({ rolId: ROL })).status).toBe(403);
  });

  describe("primer usuario del restaurante (bootstrap)", () => {
    beforeEach(() => {
      m.usuarios = 0;
      m.ctx = null;
    });
    it("sin el token de instalación: 403 (antes cualquiera podía crear el primer admin)", async () => {
      expect((await registrar({ rolId: ROL })).status).toBe(403);
      expect(m.crear).not.toHaveBeenCalled();
    });
    it("con token equivocado: 403", async () => {
      expect((await registrar({ rolId: ROL }, { "x-bootstrap-token": "otro" })).status).toBe(403);
    });
    it("con el token correcto: 201", async () => {
      expect((await registrar({ rolId: ROL }, { "x-bootstrap-token": "token-de-instalacion-largo" })).status).toBe(201);
    });
    it("si el servidor no tiene BOOTSTRAP_TOKEN, el bootstrap está cerrado aunque manden cualquier cosa", async () => {
      vi.stubEnv("BOOTSTRAP_TOKEN", "");
      expect((await registrar({ rolId: ROL }, { "x-bootstrap-token": "" })).status).toBe(403);
    });
    it("el primer usuario también necesita un rol válido", async () => {
      expect((await registrar({}, { "x-bootstrap-token": "token-de-instalacion-largo" })).status).toBe(400);
    });
  });
});
