import { describe, it, expect, vi } from "vitest";
import { generarSecreto, generarClaveAdmin, slugValido, hostDe } from "../scripts/nuevo-cliente/secretos";
import { crearBaseCliente } from "../scripts/nuevo-cliente/crear-base";
import { ROLES_BASE } from "../prisma/roles-base";

describe("secretos del alta de cliente", () => {
  it("el secreto JWT cumple el mínimo de producción (32+) y no se repite", () => {
    const a = generarSecreto(48);
    expect(a.length).toBeGreaterThanOrEqual(32);
    expect(a).not.toBe(generarSecreto(48));
  });

  it("la clave del administrador tiene 20 caracteres, mayúscula, minúscula y número, sin confundibles", () => {
    for (let i = 0; i < 50; i++) {
      const c = generarClaveAdmin();
      expect(c).toHaveLength(20);
      expect(c).toMatch(/[a-z]/);
      expect(c).toMatch(/[A-Z]/);
      expect(c).toMatch(/[0-9]/);
      expect(c).not.toMatch(/[lI1O0]/);
    }
  });

  it("slug: acepta formatos válidos y rechaza el resto", () => {
    for (const ok of ["mi-resto", "cozizina", "a1b"]) expect(slugValido(ok)).toBe(true);
    for (const mal of ["", "ab", "-resto", "resto-", "Mi Resto", "a_b", "x".repeat(41), "../etc"]) expect(slugValido(mal)).toBe(false);
  });

  it("hostDe devuelve el host o null", () => {
    expect(hostDe("postgresql://u:p@db.abc.supabase.co:5432/postgres")).toBe("db.abc.supabase.co:5432");
    expect(hostDe("no es url")).toBeNull();
  });
});

describe("crearBaseCliente", () => {
  const armar = (existe: boolean) => {
    const tx = {
      tenant: { create: vi.fn() },
      sucursal: { create: vi.fn() },
      rol: { create: vi.fn() },
      usuario: { create: vi.fn() },
      usuarioRol: { create: vi.fn() },
    };
    const prisma = {
      tenant: { findUnique: vi.fn().mockResolvedValue(existe ? { id: "x" } : null) },
      $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    };
    return { prisma, tx };
  };
  const alta = { nombre: "Resto", slug: "resto", sucursal: "Centro", adminEmail: "d@r.com", adminNombre: "Resto", claveAdmin: "Abcdefghjk23456789xy" };

  it("crea tenant, sucursal, todos los roles y un admin con rol Administrador; guarda hash, no la clave", async () => {
    const { prisma, tx } = armar(false);
    await crearBaseCliente(prisma as never, alta);
    expect(tx.tenant.create).toHaveBeenCalledOnce();
    expect(tx.rol.create).toHaveBeenCalledTimes(ROLES_BASE.length);
    const usuario = tx.usuario.create.mock.calls[0][0].data;
    expect(usuario.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(JSON.stringify(usuario)).not.toContain(alta.claveAdmin);
    const admin = tx.rol.create.mock.calls.map((c) => c[0].data).find((d) => d.nombre === "Administrador");
    expect(tx.usuarioRol.create.mock.calls[0][0].data.rolId).toBe(admin.id);
  });

  it("si el slug ya existe no escribe nada", async () => {
    const { prisma } = armar(true);
    await expect(crearBaseCliente(prisma as never, alta)).rejects.toThrow(/Ya existe/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
