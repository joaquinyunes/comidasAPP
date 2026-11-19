import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/limite-intentos", async () => (await import("./ayudas/falso-limite-intentos")).falso);

import { estaBloqueado, registrarFallo, limpiarFallos } from "@/lib/auth/bloqueo-login";
import { falso } from "./ayudas/falso-limite-intentos";

beforeEach(() => {
  falso.vaciar();
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
});
afterEach(() => vi.useRealTimers());

describe("bloqueo de login por cuenta (contadores en base de datos)", () => {
  it("bloquea al 5º fallo y avisa cuántos segundos faltan", async () => {
    const k = "a@x.com";
    for (let i = 0; i < 4; i++) await registrarFallo(k);
    expect(await estaBloqueado(k)).toBe(0);
    await registrarFallo(k);
    expect(await estaBloqueado(k)).toBe(900);
  });

  it("se libera pasada la ventana de 15 minutos", async () => {
    const k = "b@x.com";
    for (let i = 0; i < 5; i++) await registrarFallo(k);
    vi.setSystemTime(1_000_000 + 15 * 60_000 + 1);
    expect(await estaBloqueado(k)).toBe(0);
  });

  it("un login correcto limpia los fallos", async () => {
    const k = "c@x.com";
    for (let i = 0; i < 5; i++) await registrarFallo(k);
    await limpiarFallos(k);
    expect(await estaBloqueado(k)).toBe(0);
  });

  it("las cuentas no se afectan entre sí, ni el login con el 2FA", async () => {
    for (let i = 0; i < 5; i++) await registrarFallo("d@x.com");
    expect(await estaBloqueado("e@x.com")).toBe(0);
    expect(await estaBloqueado("d@x.com", "2fa")).toBe(0);
    for (let i = 0; i < 5; i++) await registrarFallo("u1", "2fa");
    expect(await estaBloqueado("u1", "2fa")).toBeGreaterThan(0);
    expect(await estaBloqueado("u1")).toBe(0);
  });
});
