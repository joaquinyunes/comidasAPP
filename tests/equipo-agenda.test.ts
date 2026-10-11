import { describe, it, expect } from "vitest";
import { agruparPorDia, diaDe, horaDe, horasDeTurno } from "@/lib/equipo/agenda";

describe("lectura de fechas del backend", () => {
  it("extrae hora y día", () => {
    expect(horaDe("1970-01-01T09:30:00.000Z")).toBe("09:30");
    expect(diaDe("2026-10-12T00:00:00.000Z")).toBe("2026-10-12");
  });
});

describe("agruparPorDia", () => {
  const t = (fecha: string, hora: string, id: string) => ({
    id,
    fecha: `${fecha}T00:00:00.000Z`,
    horaInicio: `1970-01-01T${hora}:00.000Z`,
  });

  it("descarta lo anterior a hoy y ordena por día y hora", () => {
    const g = agruparPorDia(
      [t("2026-10-12", "20:00", "c"), t("2026-10-10", "09:00", "viejo"), t("2026-10-12", "09:00", "b"), t("2026-10-11", "12:00", "a")],
      "2026-10-11"
    );
    expect(g.map((x) => x.dia)).toEqual(["2026-10-11", "2026-10-12"]);
    expect(g[1].turnos.map((x) => x.id)).toEqual(["b", "c"]);
  });
});

describe("horasDeTurno", () => {
  it("calcula horas, incluso cruzando medianoche", () => {
    expect(horasDeTurno("09:00", "17:30")).toBe(8.5);
    expect(horasDeTurno("20:00", "02:00")).toBe(6);
  });
});
