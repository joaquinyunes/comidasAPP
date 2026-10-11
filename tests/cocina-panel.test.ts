import { describe, it, expect } from "vitest";
import { minutosDesde, nivelDemora, ordenarComandas } from "@/lib/cocina/demora";
import { estacionesDe, filtrarPorEstacion, SIN_ESTACION } from "@/lib/cocina/estaciones";

describe("demora", () => {
  it("calcula minutos enteros y no da negativos", () => {
    const ahora = Date.parse("2026-10-11T12:00:00Z");
    expect(minutosDesde("2026-10-11T11:47:30Z", ahora)).toBe(12);
    expect(minutosDesde("2026-10-11T12:05:00Z", ahora)).toBe(0);
    expect(minutosDesde("no-es-fecha", ahora)).toBe(0);
  });

  it("marca atención a los 10 y crítica a los 15", () => {
    expect(nivelDemora(9)).toBe("normal");
    expect(nivelDemora(10)).toBe("atencion");
    expect(nivelDemora(15)).toBe("critica");
  });

  it("ordena: lo urgente primero, después lo más viejo", () => {
    const orden = ordenarComandas([
      { id: "nueva", desde: "2026-10-11T12:10:00Z", items: [{ urgente: false }] },
      { id: "vieja", desde: "2026-10-11T11:50:00Z", items: [{ urgente: false }] },
      { id: "urgente", desde: "2026-10-11T12:05:00Z", items: [{ urgente: true }] },
    ]);
    expect(orden.map((c) => c.id)).toEqual(["urgente", "vieja", "nueva"]);
  });
});

describe("estaciones", () => {
  const comandas = [
    { id: "1", items: [{ estacion: "Parrilla" }, { estacion: "Barra" }] },
    { id: "2", items: [{ estacion: "Barra" }] },
    { id: "3", items: [{ estacion: null }] },
  ];

  it("lista las estaciones presentes", () => {
    expect(estacionesDe(comandas)).toEqual(["Barra", "Parrilla", SIN_ESTACION].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("filtra ítems por estación y descarta comandas vacías", () => {
    const barra = filtrarPorEstacion(comandas, "Barra");
    expect(barra.map((c) => c.id)).toEqual(["1", "2"]);
    expect(barra[0].items).toHaveLength(1);
    expect(filtrarPorEstacion(comandas, null)).toHaveLength(3);
  });
});
