import { describe, it, expect } from "vitest";
import { calcular, P } from "../scripts/tabla-3-anios.mjs";

describe("tabla de costo a 3 años (V2)", () => {
  it("Fudo: suma de plan y módulos por 36 meses, con y sin descuento anual", () => {
    const r = calcular(0);
    expect(r.fudoMes).toBe(65900);
    expect(Math.round(r.fudoMensualUsd)).toBe(Math.round((65900 * 36) / P.arsPorUsd));
    expect(r.fudoAnualUsd).toBeCloseTo(r.fudoMensualUsd * 0.85, 6);
  });

  it("Cozizina: Completo incluye 12 meses; Instalación paga los 36", () => {
    const r = calcular(0);
    expect(r.cozizinaCompletoUsd).toBe(10000 + 120 * 24);
    expect(r.cozizinaInstalacionMasMensualUsd).toBe(3500 + 120 * 36);
  });

  it("punto de equilibrio: con esas ventas el ahorro iguala la diferencia", () => {
    const base = calcular(0);
    const conVentas = calcular(base.ventasEquilibrioMensualArs);
    expect(conVentas.ahorro3AniosUsd).toBeCloseTo(base.cozizinaCompletoUsd - base.fudoAnualUsd, 4);
  });

  it("sin ventas por apps no hay ahorro", () => {
    expect(calcular(0).ahorro3AniosUsd).toBe(0);
  });
});
