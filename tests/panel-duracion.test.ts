import { describe, it, expect } from "vitest";
import { formatoDuracion } from "@/lib/panel/duracion";

describe("formatoDuracion", () => {
  it("usa minutos hasta la hora", () => {
    expect(formatoDuracion(0)).toBe("0 min");
    expect(formatoDuracion(59)).toBe("59 min");
  });

  it("pasa a horas y completa los minutos", () => {
    expect(formatoDuracion(60)).toBe("1 h");
    expect(formatoDuracion(65)).toBe("1 h 05 min");
    expect(formatoDuracion(604)).toBe("10 h 04 min");
  });

  it("no devuelve valores negativos", () => {
    expect(formatoDuracion(-5)).toBe("0 min");
  });
});
