import { describe, it, expect } from "vitest";
import { cabecerasCsp, modoCsp, politicaCsp } from "@/config/csp";

describe("CSP (S2)", () => {
  it("por defecto y con cualquier valor raro queda en reporte", () => {
    expect(modoCsp(undefined)).toBe("reporte");
    expect(modoCsp("")).toBe("reporte");
    expect(modoCsp("BLOQUEAR ")).toBe("reporte");
    expect(modoCsp("bloquear")).toBe("bloquear");
  });

  it("modo reporte: frame-ancestors aplicado y la política completa solo como Report-Only con report-uri", () => {
    const h = cabecerasCsp("reporte");
    expect(h).toEqual([
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "Content-Security-Policy-Report-Only", value: expect.stringContaining("report-uri /api/csp") },
    ]);
  });

  it("modo bloqueo: una sola cabecera Content-Security-Policy con la política completa, sin Report-Only", () => {
    const h = cabecerasCsp("bloquear");
    expect(h).toHaveLength(1);
    expect(h[0].key).toBe("Content-Security-Policy");
    expect(h[0].value).toContain("default-src 'self'");
    expect(h[0].value).toContain("frame-ancestors 'none'");
    expect(h[0].value).not.toContain("report-uri");
  });

  it("la política no abre lo que no debe: sin object-src ni base-uri externos y sin unsafe-eval", () => {
    const p = politicaCsp("bloquear");
    expect(p).toContain("object-src 'none'");
    expect(p).toContain("base-uri 'self'");
    expect(p).not.toContain("'unsafe-eval'");
    expect(p).not.toMatch(/script-src[^;]*https:/);
  });
});
