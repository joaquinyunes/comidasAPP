import { describe, it, expect } from "vitest";
import {
  puedeTransicionarPedido,
  puedeTransicionarItem,
  esEstadoPedido,
} from "@/lib/pedidos/estados";

describe("máquina de estados de pedido", () => {
  it("permite avanzar recibido -> en_preparacion -> listo -> entregado -> pagado", () => {
    expect(puedeTransicionarPedido("recibido", "en_preparacion")).toBe(true);
    expect(puedeTransicionarPedido("en_preparacion", "listo")).toBe(true);
    expect(puedeTransicionarPedido("listo", "entregado")).toBe(true);
    expect(puedeTransicionarPedido("entregado", "pagado")).toBe(true);
  });

  it("no permite retroceder", () => {
    expect(puedeTransicionarPedido("listo", "recibido")).toBe(false);
    expect(puedeTransicionarPedido("entregado", "en_preparacion")).toBe(false);
  });

  it("no deja salir de estados terminales", () => {
    expect(puedeTransicionarPedido("pagado", "entregado")).toBe(false);
    expect(puedeTransicionarPedido("cancelado", "recibido")).toBe(false);
  });

  it("acepta la transición a sí mismo (idempotente)", () => {
    expect(puedeTransicionarPedido("listo", "listo")).toBe(true);
  });

  it("rechaza estados desconocidos", () => {
    expect(puedeTransicionarPedido("abierto", "recibido")).toBe(false);
    expect(esEstadoPedido("abierto")).toBe(false);
    expect(esEstadoPedido("pagado")).toBe(true);
  });
});

describe("máquina de estados de ítem", () => {
  it("permite pausar y reanudar", () => {
    expect(puedeTransicionarItem("en_preparacion", "en_pausa")).toBe(true);
    expect(puedeTransicionarItem("en_pausa", "en_preparacion")).toBe(true);
  });

  it("permite anular en cualquier punto no terminal", () => {
    expect(puedeTransicionarItem("recibido", "anulado")).toBe(true);
    expect(puedeTransicionarItem("listo", "anulado")).toBe(true);
    expect(puedeTransicionarItem("entregado", "anulado")).toBe(false);
  });
});
