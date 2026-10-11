import { describe, it, expect } from "vitest";
import { describirDescuento, estadoCupon, usosRestantes } from "@/lib/marketing/cupon";

const AHORA = Date.parse("2026-10-11T12:00:00Z");
const base = {
  tipo: "porcentaje",
  valor: 10,
  fechaInicio: "2026-10-01T00:00:00Z",
  fechaFin: "2026-12-31T00:00:00Z",
  usosMaximos: 100,
  usosActuales: 10,
  activo: true,
};

describe("describirDescuento", () => {
  it("lo dice como se lo diría un cliente", () => {
    expect(describirDescuento("porcentaje", 10)).toBe("10% de descuento");
    expect(describirDescuento("monto_fijo", 900)).toBe("$900 de descuento");
    expect(describirDescuento("2x1", 0)).toBe("2x1");
  });
});

describe("estadoCupon", () => {
  it("vigente cuando está activo, con usos y en fecha", () => {
    expect(estadoCupon(base, AHORA)).toBe("vigente");
  });
  it("pausado manda sobre todo lo demás", () => {
    expect(estadoCupon({ ...base, activo: false, usosActuales: 100 }, AHORA)).toBe("pausado");
  });
  it("agotado cuando se usó el máximo", () => {
    expect(estadoCupon({ ...base, usosActuales: 100 }, AHORA)).toBe("agotado");
  });
  it("vencido y próximo según las fechas", () => {
    expect(estadoCupon({ ...base, fechaFin: "2026-10-01T00:00:00Z" }, AHORA)).toBe("vencido");
    expect(estadoCupon({ ...base, fechaInicio: "2026-11-01T00:00:00Z" }, AHORA)).toBe("proximo");
  });
});

describe("usosRestantes", () => {
  it("nunca es negativo", () => {
    expect(usosRestantes({ usosMaximos: 10, usosActuales: 4 })).toBe(6);
    expect(usosRestantes({ usosMaximos: 10, usosActuales: 12 })).toBe(0);
  });
});
