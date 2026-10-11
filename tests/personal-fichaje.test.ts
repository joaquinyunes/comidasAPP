import { describe, it, expect } from "vitest";
import { accionesDeFichaje, resumirPlantel } from "@/lib/personal/fichaje";

describe("accionesDeFichaje", () => {
  it("quien no fichó, ficha entrada", () => {
    expect(accionesDeFichaje("sin_fichar").map((a) => a.tipo)).toEqual(["ENTRADA"]);
    expect(accionesDeFichaje("con_turno").map((a) => a.tipo)).toEqual(["ENTRADA"]);
  });

  it("quien trabaja puede salir o descansar, con la salida como principal", () => {
    const a = accionesDeFichaje("trabajando");
    expect(a.map((x) => x.tipo)).toEqual(["SALIDA", "BREAK_IN"]);
    expect(a[0].principal).toBe(true);
  });

  it("en descanso solo puede volver", () => {
    expect(accionesDeFichaje("en_break").map((a) => a.tipo)).toEqual(["BREAK_OUT"]);
  });

  it("quien terminó no tiene acciones", () => {
    expect(accionesDeFichaje("finalizo")).toEqual([]);
  });
});

describe("resumirPlantel", () => {
  it("cuenta trabajando, en descanso y faltantes", () => {
    expect(resumirPlantel(["trabajando", "trabajando", "en_break", "con_turno", "sin_fichar", "finalizo"])).toEqual({
      trabajando: 2,
      enDescanso: 1,
      faltan: 2,
    });
  });
});
