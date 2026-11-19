import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT, decodeJwt } from "jose";
import { hashSync } from "bcryptjs";
import { codigoTotp } from "@/lib/auth/totp";

const SECRETO = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
const m = vi.hoisted(() => ({
  usuario: null as null | Record<string, unknown>,
  permisos: ["*"] as string[],
  actualizado: null as unknown,
}));

vi.mock("@/lib/auth-context", () => ({ getTenantContext: async () => ({ tenantId: "t1", usuarioId: "u1", roles: [], permisos: m.permisos }) }));
vi.mock("@/lib/rate-limit", () => ({ authRateLimit: async () => null }));
vi.mock("@/lib/limite-intentos", async () => (await import("./ayudas/falso-limite-intentos")).falso);
vi.mock("@/lib/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: async () => ({ ...m.usuario, usuarioRoles: [{ rol: { nombre: "x", permisos: m.permisos } }] }),
      update: async ({ data }: { data: Record<string, unknown> }) => ((m.actualizado = data), Object.assign(m.usuario!, data), {}),
    },
    auditLog: { create: async () => ({}) },
    sesion: { create: async () => ({}), deleteMany: async () => ({ count: 0 }) },
  },
}));

import { PUT, DELETE } from "@/app/api/auth/2fa/route";
import { emitirSesion } from "@/lib/auth/emitir-sesion";
import { proxy } from "@/proxy";
import { falso } from "./ayudas/falso-limite-intentos";
import { NextResponse } from "next/server";

const base = () => ({
  id: "u1", tenantId: "t1", email: "a@x.com", nombre: "A", activo: true,
  passwordHash: hashSync("clave-larga-12345", 4), totpActivo: false, totpSecreto: SECRETO,
});
const req = (metodo: string, body: object) =>
  new NextRequest("http://x/api/auth/2fa", { method: metodo, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

beforeEach(() => {
  falso.vaciar();
  m.usuario = base();
  m.permisos = ["*"];
  m.actualizado = null;
  vi.stubEnv("ADMIN_2FA_OBLIGATORIO", "1");
});
afterEach(() => vi.unstubAllEnvs());

const tokenDe = async (res: NextResponse) => res.cookies.get("token")!.value;

describe("2FA obligatorio para el administrador", () => {
  it("el administrador sin 2FA recibe un token con debe2fa; con 2FA activo, no", async () => {
    const sin = NextResponse.json({});
    await emitirSesion(sin, { ...base(), usuarioRoles: [{ rol: { nombre: "admin", permisos: ["*"] } }] } as never);
    expect(decodeJwt(await tokenDe(sin)).debe2fa).toBe(true);

    const con = NextResponse.json({});
    await emitirSesion(con, { ...base(), totpActivo: true, usuarioRoles: [{ rol: { nombre: "admin", permisos: ["*"] } }] } as never);
    expect(decodeJwt(await tokenDe(con)).debe2fa).toBeUndefined();
  });

  it("un rol que no es administrador no queda obligado", async () => {
    const r = NextResponse.json({});
    await emitirSesion(r, { ...base(), usuarioRoles: [{ rol: { nombre: "mozo", permisos: ["pedidos:leer"] } }] } as never);
    expect(decodeJwt(await tokenDe(r)).debe2fa).toBeUndefined();
  });

  it("fuera de producción y sin la variable, no se exige (desarrollo)", async () => {
    vi.stubEnv("ADMIN_2FA_OBLIGATORIO", "");
    const r = NextResponse.json({});
    await emitirSesion(r, { ...base(), usuarioRoles: [{ rol: { nombre: "admin", permisos: ["*"] } }] } as never);
    expect(decodeJwt(await tokenDe(r)).debe2fa).toBeUndefined();
  });

  describe("proxy con sesión marcada debe2fa", () => {
    const firmar = (extra: object) =>
      new SignJWT({ userId: "u1", tenantId: "t1", email: "a@x.com", roles: ["admin"], permisos: ["*"], ...extra })
        .setProtectedHeader({ alg: "HS256" }).setExpirationTime("10m").sign(new TextEncoder().encode(process.env.JWT_SECRET!));
    const ir = async (ruta: string, extra: object) =>
      proxy(new NextRequest("http://localhost" + ruta, { headers: { cookie: `token=${await firmar(extra)}` } }));

    it("API: 403 con requiere2fa; Mi cuenta pasa; el resto del panel redirige a Mi cuenta", async () => {
      const api = await ir("/api/pedidos", { debe2fa: true });
      expect(api.status).toBe(403);
      expect((await api.json()).requiere2fa).toBe(true);
      expect((await ir("/dashboard/cuenta", { debe2fa: true })).status).toBe(200);
      const pag = await ir("/dashboard/pedidos", { debe2fa: true });
      expect(pag.status).toBe(307);
      expect(pag.headers.get("location")).toContain("/dashboard/cuenta");
    });

    it("sin la marca todo sigue igual", async () => {
      expect((await ir("/api/pedidos", {})).status).toBe(200);
      expect((await ir("/dashboard/pedidos", {})).status).toBe(200);
    });
  });

  describe("ruta /api/auth/2fa", () => {
    it("activar con el código correcto reemite la sesión (sin debe2fa) y guarda totpActivo", async () => {
      m.usuario = { ...base() };
      const res = await PUT(req("PUT", { codigo: codigoTotp(SECRETO) }));
      expect(res.status).toBe(200);
      expect(m.actualizado).toEqual({ totpActivo: true });
      expect(res.headers.getSetCookie().join("\n")).toMatch(/token=.+HttpOnly/i);
    });

    it("el administrador no puede desactivarlo", async () => {
      m.usuario = { ...base(), totpActivo: true };
      const res = await DELETE(req("DELETE", { password: "clave-larga-12345", codigo: codigoTotp(SECRETO) }));
      expect(res.status).toBe(403);
      expect(m.actualizado).toBeNull();
    });

    it("un usuario común sí puede desactivarlo", async () => {
      m.usuario = { ...base(), totpActivo: true };
      m.permisos = ["pedidos:leer"];
      const res = await DELETE(req("DELETE", { password: "clave-larga-12345", codigo: codigoTotp(SECRETO) }));
      expect(res.status).toBe(200);
    });

    it("5 códigos incorrectos bloquean los intentos (429), incluso con el código bueno", async () => {
      for (let i = 0; i < 5; i++) expect((await PUT(req("PUT", { codigo: "000000" }))).status).toBe(400);
      const res = await PUT(req("PUT", { codigo: codigoTotp(SECRETO) }));
      expect(res.status).toBe(429);
      expect(m.actualizado).toBeNull();
    });
  });
});
