import { describe, it, expect } from "vitest";
import { variacionPorcentual, textoVariacion } from "@/lib/panel/variacion";

describe("variacionPorcentual", () => {
  it("calcula el cambio en porcentaje entero", () => {
    expect(variacionPorcentual(120, 100)).toBe(20);
    expect(variacionPorcentual(75, 100)).toBe(-25);
    expect(variacionPorcentual(100, 100)).toBe(0);
  });

  it("sin base de comparación devuelve null", () => {
    expect(variacionPorcentual(50, 0)).toBeNull();
    expect(variacionPorcentual(50, -1)).toBeNull();
    expect(variacionPorcentual(NaN, 10)).toBeNull();
  });
});

describe("textoVariacion", () => {
  it("lo dice en palabras del salón", () => {
    expect(textoVariacion(20)).toBe("+20% vs ayer");
    expect(textoVariacion(-5)).toBe("-5% vs ayer");
    expect(textoVariacion(0)).toBe("Igual que ayer");
    expect(textoVariacion(null)).toBe("Sin datos de ayer");
  });
});
