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
