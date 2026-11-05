import { describe, it, expect } from "vitest";
import { estaBloqueado, registrarFallo, limpiarFallos } from "@/lib/auth/bloqueo-login";

describe("bloqueo de login por cuenta", () => {
  it("bloquea al 5º fallo y avisa cuántos segundos faltan", () => {
    const k = "a@x.com";
    for (let i = 0; i < 4; i++) registrarFallo(k, 1000);
    expect(estaBloqueado(k, 1000)).toBe(0);
    registrarFallo(k, 1000);
    expect(estaBloqueado(k, 1000)).toBe(900);
  });

  it("se libera pasada la ventana de 15 minutos", () => {
    const k = "b@x.com";
    for (let i = 0; i < 5; i++) registrarFallo(k, 0);
    expect(estaBloqueado(k, 15 * 60_000 + 1)).toBe(0);
  });

  it("un login correcto limpia los fallos", () => {
    const k = "c@x.com";
    for (let i = 0; i < 5; i++) registrarFallo(k, 0);
    limpiarFallos(k);
    expect(estaBloqueado(k, 1)).toBe(0);
  });

  it("las cuentas no se afectan entre sí", () => {
    for (let i = 0; i < 5; i++) registrarFallo("d@x.com", 0);
    expect(estaBloqueado("e@x.com", 1)).toBe(0);
  });
});
