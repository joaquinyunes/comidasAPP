import { describe, it, expect } from "vitest";
import { progresoPedido, estadoPedidoDerivado } from "@/lib/pedidos/progreso";

const item = (estado: string, anulado = false) => ({ estado, anulado });

describe("progreso del pedido", () => {
  it("0% cuando todo está recién recibido", () => {
    expect(progresoPedido([item("recibido"), item("recibido")])).toBe(0);
  });

  it("100% cuando todo fue entregado", () => {
    expect(progresoPedido([item("entregado"), item("entregado")])).toBe(100);
  });

  it("ignora ítems anulados", () => {
    expect(progresoPedido([item("entregado"), item("recibido", true)])).toBe(100);
  });

  it("0% si no hay ítems vigentes", () => {
    expect(progresoPedido([item("recibido", true)])).toBe(0);
  });
});

describe("estado derivado del pedido", () => {
  it("en_preparacion si algún ítem se está preparando", () => {
    expect(estadoPedidoDerivado([item("recibido"), item("en_preparacion")])).toBe("en_preparacion");
  });

  it("listo solo cuando todos están listos o entregados", () => {
    expect(estadoPedidoDerivado([item("listo"), item("entregado")])).toBe("listo");
    expect(estadoPedidoDerivado([item("listo"), item("recibido")])).toBe("recibido");
  });

  it("entregado cuando todos fueron entregados", () => {
    expect(estadoPedidoDerivado([item("entregado"), item("entregado")])).toBe("entregado");
  });

  it("null si no hay ítems vigentes", () => {
    expect(estadoPedidoDerivado([item("recibido", true)])).toBeNull();
  });
});
