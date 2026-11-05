import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashSync } from "bcryptjs";
import { codigoTotp } from "@/lib/auth/totp";

const SECRETO = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
const m = vi.hoisted(() => ({ usuario: null as unknown, sesiones: [] as unknown[] }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    usuario: { findFirst: async () => m.usuario },
    sesion: { create: async ({ data }: { data: unknown }) => (m.sesiones.push(data), {}), deleteMany: async () => ({ count: 0 }) },
  },
}));
vi.mock("@/lib/rate-limit", () => ({ authRateLimit: async () => null }));

import { POST } from "@/app/api/auth/login/route";

const usuario = (extra: object = {}) => ({
  id: "u1",
  tenantId: "t1",
  email: "dueno@cozizina.test",
  nombre: "Dueño",
  activo: true,
  passwordHash: hashSync("clave-larga-12345", 4),
  totpActivo: false,
  totpSecreto: null,
  usuarioRoles: [{ rol: { nombre: "admin", permisos: ["*"] } }],
  ...extra,
});

let n = 0;
const login = (body: object) =>
  POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as never
  );

// Cada test usa su propio email para que el bloqueo por cuenta no se arrastre.
const mail = () => `u${++n}@cozizina.test`;

beforeEach(() => {
  m.usuario = usuario();
  m.sesiones = [];
});

describe("login", () => {
  it("sin 2FA: entra y deja cookies token (acceso) y refresh (HttpOnly)", async () => {
    const res = await login({ email: mail(), password: "clave-larga-12345" });
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie().join("\n");
    expect(cookies).toMatch(/token=.+HttpOnly/i);
    expect(cookies).toMatch(/refresh=.+HttpOnly/i);
    expect(cookies).toMatch(/refresh=[^;]+;.*Path=\/api\/auth/i);
    expect(m.sesiones).toHaveLength(1);
  });

  it("contraseña incorrecta: 401 sin cookies", async () => {
    const res = await login({ email: mail(), password: "otra-clave-cualquiera" });
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("con 2FA activo: sin código pide el código y no inicia sesión", async () => {
    m.usuario = usuario({ totpActivo: true, totpSecreto: SECRETO });
    const res = await login({ email: mail(), password: "clave-larga-12345" });
    expect(res.status).toBe(401);
    expect((await res.json()).requiere2fa).toBe(true);
    expect(m.sesiones).toHaveLength(0);
  });

  it("con 2FA activo: código malo es 401, código bueno entra", async () => {
    m.usuario = usuario({ totpActivo: true, totpSecreto: SECRETO });
    const email = mail();
    const malo = await login({ email, password: "clave-larga-12345", codigo: "000000" });
    expect(malo.status).toBe(401);
    const bueno = await login({ email, password: "clave-larga-12345", codigo: codigoTotp(SECRETO) });
    expect(bueno.status).toBe(200);
  });

  it("5 fallos seguidos bloquean la cuenta (429) aunque después llegue la clave correcta", async () => {
    const email = mail();
    for (let i = 0; i < 5; i++) await login({ email, password: "mala-clave-123456" });
    const res = await login({ email, password: "clave-larga-12345" });
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
});
