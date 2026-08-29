import { describe, it, expect } from "vitest";
import { evaluarCupon, type CuponEvaluable } from "@/lib/pedidos/cupon";

const base: CuponEvaluable = {
  codigo: "BIENVENIDA10",
  tipo: "porcentaje",
  valor: 10,
  activo: true,
  fechaInicio: new Date(Date.now() - 86400000),
  fechaFin: new Date(Date.now() + 86400000),
  usosMaximos: 100,
  usosActuales: 5,
  minimoCompra: 2000,
};

describe("evaluarCupon", () => {
  it("aplica un porcentaje", () => {
    const r = evaluarCupon(base, 5000);
    expect(r).toEqual({ valido: true, descuento: 500, descripcion: "10% de descuento" });
  });

  it("aplica un monto fijo, sin pasarse del subtotal", () => {
    const r = evaluarCupon({ ...base, tipo: "monto_fijo", valor: 3000 }, 5000);
    expect(r).toMatchObject({ valido: true, descuento: 3000 });
    const r2 = evaluarCupon({ ...base, tipo: "monto_fijo", valor: 9000, minimoCompra: 0 }, 5000);
    expect(r2).toMatchObject({ valido: true, descuento: 5000 });
  });

  it("rechaza si no llega al mínimo de compra", () => {
    const r = evaluarCupon(base, 1500);
    expect(r.valido).toBe(false);
  });

  it("rechaza si está inactivo, vencido o sin usos", () => {
    expect(evaluarCupon({ ...base, activo: false }, 5000).valido).toBe(false);
    expect(evaluarCupon({ ...base, fechaFin: new Date(Date.now() - 1000) }, 5000).valido).toBe(false);
    expect(evaluarCupon({ ...base, usosActuales: 100 }, 5000).valido).toBe(false);
  });

  it("rechaza tipos no soportados (2x1)", () => {
    expect(evaluarCupon({ ...base, tipo: "2x1" }, 5000).valido).toBe(false);
  });
});
