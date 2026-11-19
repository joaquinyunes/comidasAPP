import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/limite-intentos", async () => (await import("./ayudas/falso-limite-intentos")).falso);

import { contarPedidoDeMesa, normalizarReferencia } from "@/lib/limite-qr";
import { falso } from "./ayudas/falso-limite-intentos";

beforeEach(() => falso.vaciar());

describe("topes de pedidos del QR del local (M10)", () => {
  it("la misma IP con una referencia distinta en cada pedido se bloquea en el pedido 31", async () => {
    const r: boolean[] = [];
    for (let i = 0; i < 31; i++) r.push((await contarPedidoDeMesa(`mesa-${i}`, "1.1.1.1")).bloqueado);
    expect(r.slice(0, 30).every((b) => !b)).toBe(true);
    expect(r[30]).toBe(true);
  });
  it("la misma mesa desde muchas IPs se bloquea en el pedido 31", async () => {
    let bloqueado = false;
    for (let i = 0; i < 31; i++) bloqueado = (await contarPedidoDeMesa("Mesa 9", `2.2.${i}.1`)).bloqueado;
    expect(bloqueado).toBe(true);
  });
  it("tope global del local: 300 pedidos en 10 minutos aunque cambien IP y mesa", async () => {
    let bloqueado = false;
    for (let i = 0; i < 301; i++) bloqueado = (await contarPedidoDeMesa(`m${i}`, `3.3.${i}.1`)).bloqueado;
    expect(bloqueado).toBe(true);
  });
  it("normaliza la referencia", () => {
    expect(new Set(["Mesa 5", "mesa-5", "MESA5", " mesa  5 "].map(normalizarReferencia)).size).toBe(1);
    expect(normalizarReferencia("!!!")).toBe("sin-referencia");
  });
});
