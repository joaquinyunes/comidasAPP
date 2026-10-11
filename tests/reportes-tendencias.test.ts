import { describe, it, expect } from "vitest";
import { ventasPorDia, pedidosPorHora } from "@/lib/reportes/tendencias";

// 11 oct 2026 12:00 hora de Buenos Aires = 15:00 UTC
const AHORA = new Date("2026-10-11T15:00:00Z");

describe("ventasPorDia", () => {
  it("devuelve una serie completa, con ceros en los días sin ventas", () => {
    const s = ventasPorDia([], 3, AHORA);
    expect(s.map((d) => d.fecha)).toEqual(["2026-10-09", "2026-10-10", "2026-10-11"]);
    expect(s.every((d) => d.total === 0 && d.cobros === 0)).toBe(true);
  });

  it("suma por día en la zona del local, no en UTC", () => {
    // 11 oct 01:30 UTC es todavía 10 oct 22:30 en Buenos Aires
    const s = ventasPorDia(
      [
        { monto: 1000, createdAt: new Date("2026-10-11T01:30:00Z") },
        { monto: 500, createdAt: new Date("2026-10-11T14:00:00Z") },
        { monto: 250, createdAt: new Date("2026-10-11T14:05:00Z") },
      ],
      2,
      AHORA
    );
    expect(s[0]).toEqual({ fecha: "2026-10-10", total: 1000, cobros: 1 });
    expect(s[1]).toEqual({ fecha: "2026-10-11", total: 750, cobros: 2 });
  });

  it("ignora cobros fuera de la ventana", () => {
    const s = ventasPorDia([{ monto: 99, createdAt: new Date("2026-09-01T12:00:00Z") }], 2, AHORA);
    expect(s.reduce((n, d) => n + d.total, 0)).toBe(0);
  });
});

describe("pedidosPorHora", () => {
  it("cuenta por hora local", () => {
    const h = pedidosPorHora([
      new Date("2026-10-11T23:10:00Z"), // 20:10 local
      new Date("2026-10-11T23:50:00Z"), // 20:50 local
      new Date("2026-10-11T15:00:00Z"), // 12:00 local
    ]);
    expect(h).toHaveLength(24);
    expect(h[20]).toBe(2);
    expect(h[12]).toBe(1);
  });
});
