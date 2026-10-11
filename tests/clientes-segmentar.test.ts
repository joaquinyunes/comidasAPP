import { describe, it, expect } from "vitest";
import { diasDesde, perteneceA, enlaceWhatsapp } from "@/lib/clientes/segmentar";

const AHORA = Date.parse("2026-10-11T12:00:00Z");

describe("diasDesde", () => {
  it("cuenta días enteros", () => {
    expect(diasDesde("2026-10-01T12:00:00Z", AHORA)).toBe(10);
  });
  it("sin fecha devuelve null", () => {
    expect(diasDesde(null, AHORA)).toBeNull();
  });
});

describe("perteneceA", () => {
  it("frecuentes: 3 visitas o más", () => {
    expect(perteneceA({ totalVisitas: 3, ultimaVisita: null }, "frecuentes", AHORA)).toBe(true);
    expect(perteneceA({ totalVisitas: 2, ultimaVisita: null }, "frecuentes", AHORA)).toBe(false);
  });

  it("por recuperar: volvió al menos una vez pero hace 30 días o más", () => {
    expect(perteneceA({ totalVisitas: 4, ultimaVisita: "2026-08-01T00:00:00Z" }, "por_recuperar", AHORA)).toBe(true);
    expect(perteneceA({ totalVisitas: 4, ultimaVisita: "2026-10-05T00:00:00Z" }, "por_recuperar", AHORA)).toBe(false);
    expect(perteneceA({ totalVisitas: 1, ultimaVisita: "2026-01-01T00:00:00Z" }, "por_recuperar", AHORA)).toBe(false);
  });

  it("nuevos: hasta una visita", () => {
    expect(perteneceA({ totalVisitas: 1, ultimaVisita: null }, "nuevos", AHORA)).toBe(true);
    expect(perteneceA({ totalVisitas: 2, ultimaVisita: null }, "nuevos", AHORA)).toBe(false);
  });
});

describe("enlaceWhatsapp", () => {
  it("deja solo dígitos y agrega el país si falta", () => {
    expect(enlaceWhatsapp("11 5555-6666")).toBe("https://wa.me/541155556666");
    expect(enlaceWhatsapp("+54 11 5555 6666")).toBe("https://wa.me/541155556666");
  });
  it("codifica el mensaje", () => {
    expect(enlaceWhatsapp("1155556666", "Hola, ¿cómo estás?")).toContain("?text=Hola%2C%20");
  });
  it("sin teléfono válido devuelve null", () => {
    expect(enlaceWhatsapp(null)).toBeNull();
    expect(enlaceWhatsapp("123")).toBeNull();
  });
});
