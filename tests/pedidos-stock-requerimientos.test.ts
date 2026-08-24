import { describe, it, expect } from "vitest";
import { calcularRequerimientos } from "@/lib/pedidos/stock-requerimientos";

const receta = (productoId: string, ings: [string, string, number, boolean?][]) => ({
  productoId,
  recetaIngredientes: ings.map(([ingredienteId, nombre, cantidad, opcional = false]) => ({
    ingredienteId,
    cantidad,
    opcional,
    ingrediente: { nombre },
  })),
});

describe("calcularRequerimientos", () => {
  it("multiplica la receta por la cantidad pedida", () => {
    const recetas = [receta("p1", [["masa", "Masa", 0.3]])];
    const req = calcularRequerimientos(recetas, [{ productoId: "p1", cantidad: 3 }]);
    expect(req).toEqual([{ ingredienteId: "masa", nombre: "Masa", cantidad: 0.9 }]);
  });

  it("suma el mismo ingrediente entre líneas distintas", () => {
    const recetas = [
      receta("p1", [["queso", "Queso", 0.1]]),
      receta("p2", [["queso", "Queso", 0.2]]),
    ];
    const req = calcularRequerimientos(recetas, [
      { productoId: "p1", cantidad: 2 },
      { productoId: "p2", cantidad: 1 },
    ]);
    expect(req).toEqual([{ ingredienteId: "queso", nombre: "Queso", cantidad: 0.4 }]);
  });

  it("ignora ingredientes opcionales", () => {
    const recetas = [receta("p1", [["oregano", "Orégano", 0.01, true]])];
    expect(calcularRequerimientos(recetas, [{ productoId: "p1", cantidad: 5 }])).toEqual([]);
  });

  it("ignora productos sin receta", () => {
    expect(calcularRequerimientos([], [{ productoId: "p9", cantidad: 1 }])).toEqual([]);
  });
});
