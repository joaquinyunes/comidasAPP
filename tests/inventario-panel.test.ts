import { describe, it, expect } from "vitest";
import { resumirStock, porcentajeLleno, diasParaVencer } from "@/lib/inventario/resumir-stock";
import { armarMovimiento } from "@/lib/inventario/movimiento";

describe("resumirStock", () => {
  it("cuenta críticos, bajos y suma el valor", () => {
    const r = resumirStock([
      { estado: "ok", valorTotal: 100 },
      { estado: "bajo", valorTotal: 50 },
      { estado: "critico", valorTotal: 25 },
      { estado: "critico", valorTotal: 25 },
    ]);
    expect(r).toEqual({ total: 4, criticos: 2, bajos: 1, valorTotal: 200 });
  });
});

describe("porcentajeLleno", () => {
  it("usa el máximo cuando existe", () => {
    expect(porcentajeLleno(25, 10, 100)).toBe(25);
  });
  it("sin máximo usa el doble del mínimo", () => {
    expect(porcentajeLleno(10, 10, 0)).toBe(50);
  });
  it("no pasa de 100 ni baja de 0", () => {
    expect(porcentajeLleno(500, 10, 100)).toBe(100);
    expect(porcentajeLleno(0, 10, 100)).toBe(0);
  });
});

describe("diasParaVencer", () => {
  const ahora = Date.parse("2026-10-11T00:00:00Z");
  it("calcula días y marca vencidos con negativos", () => {
    expect(diasParaVencer("2026-10-14T00:00:00Z", ahora)).toBe(3);
    expect(diasParaVencer("2026-10-09T00:00:00Z", ahora)).toBe(-2);
  });
  it("sin fecha devuelve null", () => {
    expect(diasParaVencer(null, ahora)).toBeNull();
  });
});

describe("armarMovimiento", () => {
  it("mapea las acciones a tipos del backend", () => {
    expect(armarMovimiento("llego", 5, 10)).toEqual({ tipo: "entrada", cantidad: 5 });
    expect(armarMovimiento("uso", 2, 10)).toEqual({ tipo: "salida", cantidad: 2 });
    expect(armarMovimiento("tiro", 1, 10)).toEqual({ tipo: "merma", cantidad: 1 });
  });

  it("el conteo manda la diferencia, positiva o negativa", () => {
    expect(armarMovimiento("conteo", 12, 10)).toEqual({ tipo: "ajuste", cantidad: 2 });
    expect(armarMovimiento("conteo", 7, 10)).toEqual({ tipo: "ajuste", cantidad: -3 });
  });

  it("rechaza datos inútiles", () => {
    expect(armarMovimiento("conteo", 10, 10)).toBeNull();
    expect(armarMovimiento("llego", 0, 10)).toBeNull();
    expect(armarMovimiento("uso", -1, 10)).toBeNull();
    expect(armarMovimiento("uso", NaN, 10)).toBeNull();
  });
});
