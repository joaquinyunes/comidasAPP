import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hashSync } from "bcryptjs";

const m = vi.hoisted(() => ({ buscar: vi.fn(), resetFind: vi.fn(), transaccion: vi.fn(), whereLogin: [] as unknown[] }));

vi.mock("@/lib/rate-limit", () => ({ authRateLimit: async () => null }));
vi.mock("@/lib/limite-intentos", async () => (await import("./ayudas/falso-limite-intentos")).falso);
vi.mock("@/lib/prisma", () => ({
  prisma: {
    usuario: {
      findFirst: async (a: { where: unknown }) => (m.whereLogin.push(a.where), m.buscar(a)),
      update: async () => ({}),
    },
    passwordReset: { findFirst: m.resetFind, update: async () => ({}), updateMany: async () => ({}), create: async () => ({}) },
    sesion: { create: async () => ({}), deleteMany: async () => ({}) },
    $transaction: m.transaccion,
  },
}));

import { POST as confirmar } from "@/app/api/auth/reset/confirmar/route";
import { POST as solicitar } from "@/app/api/auth/reset/route";
import { POST as login } from "@/app/api/auth/login/route";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";

const json = (url: string, body: object) =>
  new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never;

beforeEach(() => {
  m.whereLogin = [];
  m.buscar.mockReset().mockResolvedValue(null);
  m.resetFind.mockReset().mockResolvedValue({ id: "r1", usuarioId: "u1" });
  m.transaccion.mockReset().mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe("B14: confirmar la recuperación de clave está deshabilitado en producción", () => {
  it("en producción responde 403 aunque el token exista, y no cambia nada", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await confirmar(json("http://x/api/auth/reset/confirmar", { token: "t".repeat(20), nueva: "una-clave-bien-larga" }));
    expect(res.status).toBe(403);
    expect(m.resetFind).not.toHaveBeenCalled();
    expect(m.transaccion).not.toHaveBeenCalled();
  });
  it("en desarrollo sigue funcionando (para probar el flujo)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const res = await confirmar(json("http://x/api/auth/reset/confirmar", { token: "t".repeat(20), nueva: "una-clave-bien-larga" }));
    expect(res.status).toBe(200);
  });
});

describe("B10: login y recuperación buscan al usuario SOLO en el restaurante de este despliegue", () => {
  it("login", async () => {
    await login(json("http://x/api/auth/login", { email: "dueno@x.com", password: "clave-larga-12345" }));
    expect(m.whereLogin[0]).toMatchObject({ email: "dueno@x.com", tenant: { slug: SITE_TENANT_SLUG } });
  });
  it("recuperación", async () => {
    await solicitar(json("http://x/api/auth/reset", { email: "dueno@x.com" }));
    expect(m.whereLogin[0]).toMatchObject({ email: "dueno@x.com", tenant: { slug: SITE_TENANT_SLUG } });
  });
  it("el mismo mail en OTRO restaurante no entra (no aparece en la búsqueda)", async () => {
    m.buscar.mockResolvedValue(null);
    const res = await login(json("http://x/api/auth/login", { email: "ajeno@x.com", password: hashSync("x", 4) + "aaaaaa" }));
    expect(res.status).toBe(401);
  });
});
