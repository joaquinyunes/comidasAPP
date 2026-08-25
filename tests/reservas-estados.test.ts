import { describe, it, expect } from "vitest";
import {
  puedeTransicionarReserva,
  esEstadoReserva,
} from "@/lib/reservas/estados";

describe("máquina de estados de reserva", () => {
  it("flujo normal: pendiente -> confirmada -> sentada", () => {
    expect(puedeTransicionarReserva("pendiente", "confirmada")).toBe(true);
    expect(puedeTransicionarReserva("confirmada", "sentada")).toBe(true);
  });

  it("se puede marcar no_show solo desde confirmada", () => {
    expect(puedeTransicionarReserva("confirmada", "no_show")).toBe(true);
    expect(puedeTransicionarReserva("pendiente", "no_show")).toBe(false);
  });

  it("no se puede volver atrás", () => {
    expect(puedeTransicionarReserva("confirmada", "pendiente")).toBe(false);
    expect(puedeTransicionarReserva("sentada", "confirmada")).toBe(false);
  });

  it("estados terminales no salen", () => {
    expect(puedeTransicionarReserva("cancelada", "pendiente")).toBe(false);
    expect(puedeTransicionarReserva("no_show", "confirmada")).toBe(false);
  });

  it("se puede cancelar desde cualquier estado no terminal", () => {
    expect(puedeTransicionarReserva("pendiente", "cancelada")).toBe(true);
    expect(puedeTransicionarReserva("confirmada", "cancelada")).toBe(true);
    expect(puedeTransicionarReserva("sentada", "cancelada")).toBe(true);
  });

  it("rechaza estados desconocidos", () => {
    expect(esEstadoReserva("archivada")).toBe(false);
    expect(puedeTransicionarReserva("pendiente", "archivada")).toBe(false);
  });
});
