import { describe, it, expect } from "vitest";
import {
  redondear2,
  subtotalLinea,
  totalPedido,
  montoPropina,
  totalConPropina,
  vueltoEfectivo,
  efectivoSuficiente,
} from "@/lib/pedidos/precio";

describe("aritmética de dinero", () => {
  it("redondea evitando errores de coma flotante", () => {
    expect(redondear2(0.1 + 0.2)).toBe(0.3);
    expect(redondear2(1.005)).toBe(1.01);
  });

  it("calcula subtotales y total", () => {
    expect(subtotalLinea(6500, 2)).toBe(13000);
    expect(totalPedido([13000, 900, 900])).toBe(14800);
  });

  it("calcula propina por porcentaje", () => {
    expect(montoPropina(10000, 10)).toBe(1000);
    expect(montoPropina(10000, 0)).toBe(0);
    expect(montoPropina(10000, -5)).toBe(0);
  });

  it("suma total con propina sin negativos", () => {
    expect(totalConPropina(10000, 1000)).toBe(11000);
    expect(totalConPropina(10000, -50)).toBe(10000);
  });

  it("calcula el vuelto en efectivo, nunca negativo", () => {
    expect(vueltoEfectivo(11000, 15000)).toBe(4000);
    expect(vueltoEfectivo(11000, 10000)).toBe(0);
  });

  it("valida si el efectivo alcanza", () => {
    expect(efectivoSuficiente(11000, 11000)).toBe(true);
    expect(efectivoSuficiente(11000, 10999.99)).toBe(false);
  });
});
