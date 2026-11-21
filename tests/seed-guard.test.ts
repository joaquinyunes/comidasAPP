import { describe, it, expect } from "vitest";
import { claveDelSeed } from "../prisma/seed-guard";

describe("guarda del seed", () => {
  it("en producción sin SEED_PASSWORD, o débil, aborta", () => {
    expect(() => claveDelSeed({ NODE_ENV: "production" })).toThrow(/SEED_PASSWORD/);
    expect(() => claveDelSeed({ NODE_ENV: "production", SEED_PASSWORD: "admin123" })).toThrow();
    expect(() => claveDelSeed({ NODE_ENV: "production", SEED_PASSWORD: "abcdefghijk" })).toThrow();
  });
  it("en producción con clave fuerte la usa", () => {
    expect(claveDelSeed({ NODE_ENV: "production", SEED_PASSWORD: "una-clave-bien-larga" })).toBe("una-clave-bien-larga");
  });
  it("en desarrollo puede usar la de siempre", () => {
    expect(claveDelSeed({ NODE_ENV: "development" })).toBe("admin123");
    expect(claveDelSeed({ NODE_ENV: "test", SEED_PASSWORD: "otra" })).toBe("otra");
  });
});

import { verificarBaseDelSeed } from "../prisma/seed-guard";

describe("guarda del seed: base de datos (M9)", () => {
  const remota = "postgresql://u:p@db.abcdef.supabase.co:5432/cozizina-demo";
  it("una base local pasa sin confirmación", () => {
    for (const h of ["localhost", "127.0.0.1", "[::1]"]) expect(() => verificarBaseDelSeed(`postgresql://u:p@${h}:5432/x`, [])).not.toThrow();
  });
  it("una base remota aborta sin --confirmo-base, y con otro host", () => {
    expect(() => verificarBaseDelSeed(remota, [])).toThrow(/--confirmo-base db\.abcdef\.supabase\.co/);
    expect(() => verificarBaseDelSeed(remota, ["--confirmo-base", "otro.host.com"])).toThrow();
  });
  it("una base remota con el host exacto confirmado pasa", () => {
    expect(() => verificarBaseDelSeed(remota, ["--confirmo-base", "db.abcdef.supabase.co"])).not.toThrow();
  });
  it("una base remota que NO es de demo aborta aunque se confirme el host", () => {
    expect(() => verificarBaseDelSeed("postgresql://u:p@db.abcdef.supabase.co:5432/postgres", ["--confirmo-base", "db.abcdef.supabase.co"])).toThrow(/DEMO/);
    expect(() => verificarBaseDelSeed("postgresql://u:p@db.demo-123.supabase.co:5432/postgres", ["--confirmo-base", "db.demo-123.supabase.co"])).not.toThrow();
  });
  it("sin DATABASE_URL o inválida aborta", () => {
    expect(() => verificarBaseDelSeed(undefined, [])).toThrow();
    expect(() => verificarBaseDelSeed("no-es-una-url", [])).toThrow();
  });
});
