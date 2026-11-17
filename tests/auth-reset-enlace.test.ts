import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// El enlace de recuperación equivale a la clave de la cuenta: no puede quedar escrito en los logs.
const m = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), crear: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { info: m.info, warn: m.warn, error: m.error, debug: vi.fn() } }));
vi.mock("@/lib/rate-limit", () => ({ authRateLimit: async () => null }));
vi.mock("@/lib/prisma", () => ({
  prisma: { usuario: { findFirst: async () => ({ id: "u1" }) }, passwordReset: { create: m.crear } },
}));

import { POST } from "@/app/api/auth/reset/route";

const pedir = () =>
  POST(new Request("http://x/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "a@b.com" }) }) as never);
const todoLoLogueado = () => JSON.stringify([m.info.mock.calls, m.warn.mock.calls, m.error.mock.calls]);

beforeEach(() => {
  [m.info, m.warn, m.error, m.crear].forEach((f) => f.mockReset());
  m.crear.mockResolvedValue({});
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/auth/reset", () => {
  it("en producción NUNCA escribe el enlace ni el token en los logs, y no deja un token sin canal de envío", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await pedir();
    expect(res.status).toBe(200);
    expect(todoLoLogueado()).not.toMatch(/recuperar\?token=|token=/);
    expect(m.crear).not.toHaveBeenCalled();
    expect(m.warn).toHaveBeenCalled(); // avisa que falta el canal de envío, sin datos sensibles
  });

  it("en desarrollo sí muestra el enlace en el log para poder probar", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await pedir();
    expect(todoLoLogueado()).toMatch(/recuperar\?token=/);
    expect(m.crear).toHaveBeenCalledOnce();
  });

  it("la respuesta no revela si el email existe (misma en ambos modos)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await (await pedir()).json()).success).toBe(true);
  });
});
