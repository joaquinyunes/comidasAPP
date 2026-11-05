import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- TOTP: vectores de prueba de la RFC 6238 (SHA-1, secreto ASCII "12345678901234567890") ----
import { codigoTotp, verificarTotp, nuevoSecretoTotp, uriOtpauth } from "@/lib/auth/totp";
import { destinoSeguro } from "@/lib/auth/destino-seguro";

const SECRETO_RFC = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // base32 de "12345678901234567890"

describe("TOTP", () => {
  it("coincide con los vectores de la RFC 6238 (6 dígitos)", () => {
    expect(codigoTotp(SECRETO_RFC, 59_000)).toBe("287082");
    expect(codigoTotp(SECRETO_RFC, 1_111_111_109_000)).toBe("081804");
    expect(codigoTotp(SECRETO_RFC, 1_234_567_890_000)).toBe("005924");
  });

  it("acepta el código del paso anterior y siguiente, no uno lejano", () => {
    const t = 1_234_567_890_000;
    expect(verificarTotp(SECRETO_RFC, "005924", t)).toBe(true);
    expect(verificarTotp(SECRETO_RFC, "005924", t + 30_000)).toBe(true);
    expect(verificarTotp(SECRETO_RFC, "005924", t + 120_000)).toBe(false);
  });

  it("rechaza códigos mal formados", () => {
    expect(verificarTotp(SECRETO_RFC, "12345", 59_000)).toBe(false);
    expect(verificarTotp(SECRETO_RFC, "abcdef", 59_000)).toBe(false);
    expect(verificarTotp(SECRETO_RFC, "", 59_000)).toBe(false);
  });

  it("genera secretos base32 de 32 caracteres y la URI otpauth", () => {
    const s = nuevoSecretoTotp();
    expect(s).toMatch(/^[A-Z2-7]{32}$/);
    expect(uriOtpauth(s, "a@b.com")).toContain(`secret=${s}`);
  });
});

describe("destinoSeguro (redirect tras renovar sesión)", () => {
  it("deja pasar rutas del panel", () => {
    expect(destinoSeguro("/dashboard")).toBe("/dashboard");
    expect(destinoSeguro("/dashboard/pedidos?estado=listo")).toBe("/dashboard/pedidos?estado=listo");
  });
  it("bloquea URLs externas, protocolo relativo y recorridos", () => {
    for (const malo of ["https://evil.com", "//evil.com", "/login", "/dashboard/../api", "javascript:alert(1)", null]) {
      expect(destinoSeguro(malo)).toBe("/dashboard");
    }
  });
});

// ---- Refresco: un solo uso, vence, y dos renovaciones juntas no ganan las dos ----
const filas = vi.hoisted(() => ({ sesiones: [] as { id: string; usuarioId: string; tokenHash: string; expiraEn: Date }[] }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    sesion: {
      create: async ({ data }: { data: { usuarioId: string; tokenHash: string; expiraEn: Date } }) => {
        filas.sesiones.push({ id: "s" + filas.sesiones.length, ...data });
        return {};
      },
      findFirst: async ({ where }: { where: { tokenHash: string; expiraEn: { gt: Date } } }) => {
        await new Promise((r) => setImmediate(r));
        return filas.sesiones.find((s) => s.tokenHash === where.tokenHash && s.expiraEn > where.expiraEn.gt) ?? null;
      },
      deleteMany: async ({ where }: { where: { id?: string; tokenHash?: string; usuarioId?: string } }) => {
        const antes = filas.sesiones.length;
        filas.sesiones = filas.sesiones.filter(
          (s) => !((where.id && s.id === where.id) || (where.tokenHash && s.tokenHash === where.tokenHash) || (where.usuarioId && s.usuarioId === where.usuarioId))
        );
        return { count: antes - filas.sesiones.length };
      },
    },
  },
}));

import { crearRefresco, consumirRefresco, revocarRefresco, revocarTodas } from "@/lib/auth/sesion-refresh";

describe("token de refresco", () => {
  beforeEach(() => {
    filas.sesiones = [];
  });

  it("guarda solo el hash, nunca el token", async () => {
    const t = await crearRefresco("u1");
    expect(filas.sesiones[0].tokenHash).not.toContain(t);
    expect(filas.sesiones[0].tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("sirve una sola vez", async () => {
    const t = await crearRefresco("u1");
    expect(await consumirRefresco(t)).toBe("u1");
    expect(await consumirRefresco(t)).toBeNull();
  });

  it("dos renovaciones simultáneas con el mismo token: gana una sola", async () => {
    const t = await crearRefresco("u1");
    const r = await Promise.all([consumirRefresco(t), consumirRefresco(t)]);
    expect(r.filter((x) => x === "u1")).toHaveLength(1);
  });

  it("un token inventado o vencido no sirve", async () => {
    expect(await consumirRefresco("inventado")).toBeNull();
    const t = await crearRefresco("u1");
    filas.sesiones[0].expiraEn = new Date(Date.now() - 1000);
    expect(await consumirRefresco(t)).toBeNull();
  });

  it("revocar una sesión o todas las del usuario", async () => {
    const a = await crearRefresco("u1");
    await crearRefresco("u1");
    await crearRefresco("u2");
    await revocarRefresco(a);
    expect(filas.sesiones).toHaveLength(2);
    await revocarTodas("u1");
    expect(filas.sesiones.map((s) => s.usuarioId)).toEqual(["u2"]);
  });
});
