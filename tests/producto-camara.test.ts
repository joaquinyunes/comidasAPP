import { describe, it, expect } from "vitest";
import { resolverTamano } from "@/components/producto-camara/tamano-estimado";
import { traeDe } from "@/components/producto-camara/trae";
import {
  TARJETA_CM,
  anchoVisibleCm,
  cmAPx,
  limitarPxPorCm,
  pxPorCmInicial,
} from "@/components/producto-camara/escala";

describe("resolverTamano", () => {
  it("usa la medida real cuando existe", () => {
    const t = resolverTamano({ nombre: "Pizza Muzzarella", tamanoCm: 30 });
    expect(t).toEqual({ cm: 30, tipo: "diametro", estimado: false });
  });

  it("estima por nombre cuando no hay medida", () => {
    expect(resolverTamano({ nombre: "Pizza 4 Quesos" })).toMatchObject({ cm: 32, estimado: true });
    expect(resolverTamano({ nombre: "Empanada de Carne" })).toMatchObject({ cm: 13, tipo: "largo" });
    expect(resolverTamano({ nombre: "IPA Artesanal" })).toMatchObject({ tipo: "alto" });
  });

  it("tiene un valor razonable para productos desconocidos", () => {
    const t = resolverTamano({ nombre: "Producto nuevo raro", tamanoCm: null });
    expect(t.cm).toBeGreaterThan(5);
    expect(t.estimado).toBe(true);
  });
});

describe("traeDe", () => {
  it("prefiere la lista explícita", () => {
    expect(traeDe({ incluye: ["Masa", " Queso "], descripcion: "otra cosa" })).toEqual(["Masa", "Queso"]);
  });

  it("deduce de la descripción cortando por comas y 'y'", () => {
    expect(traeDe({ incluye: [], descripcion: "Masa a la piedra, salsa de tomate, muzzarella y aceite de oliva." })).toEqual([
      "Masa a la piedra",
      "Salsa de tomate",
      "Muzzarella",
      "Aceite de oliva",
    ]);
  });

  it("devuelve vacío sin datos", () => {
    expect(traeDe({ incluye: null, descripcion: null })).toEqual([]);
  });
});

describe("escala", () => {
  it("da más px/cm en pantallas más anchas", () => {
    expect(pxPorCmInicial(800)).toBeGreaterThan(pxPorCmInicial(400));
  });

  it("convierte cm a px de forma lineal", () => {
    expect(cmAPx(10, 8)).toBe(80);
    expect(TARJETA_CM.ancho).toBeCloseTo(8.56);
  });

  it("limita la escala a un rango sensato", () => {
    const ancho = 400;
    expect(anchoVisibleCm(ancho, limitarPxPorCm(0.0001, ancho))).toBeCloseTo(120);
    expect(anchoVisibleCm(ancho, limitarPxPorCm(9999, ancho))).toBeCloseTo(12);
  });
});
