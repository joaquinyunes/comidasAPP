import { describe, it, expect } from "vitest";
import { resumirSalon, mesasParaAtender } from "@/lib/salon/resumir-salon";
import { ordenarMesas } from "@/lib/salon/ordenar-mesas";
import {
  agregarAlCarrito,
  cambiarCantidad,
  fijarNota,
  totalCarrito,
  unidadesCarrito,
  cantidadDe,
  MAX_POR_LINEA,
} from "@/lib/salon/carrito";

const mesa = (o: Partial<Parameters<typeof resumirSalon>[0][number]> & { numero: string }) => ({
  id: o.numero,
  estado: "libre",
  segundosDesdeCambio: 0,
  platosListos: 0,
  ...o,
});

describe("resumirSalon", () => {
  it("cuenta libres, ocupadas, cuentas pedidas y platos para llevar", () => {
    const r = resumirSalon([
      mesa({ numero: "1", estado: "libre" }),
      mesa({ numero: "2", estado: "ocupada", platosListos: 2 }),
      mesa({ numero: "3", estado: "esperando_cuenta" }),
      mesa({ numero: "4", estado: "reservada" }),
      mesa({ numero: "5", estado: "limpieza" }),
    ]);
    expect(r).toEqual({ libres: 1, ocupadas: 2, pidenCuenta: 1, platosParaLlevar: 2 });
  });
});

describe("mesasParaAtender", () => {
  it("la cuenta va antes que los platos listos, y gana la que más espera", () => {
    const orden = mesasParaAtender([
      mesa({ numero: "A", estado: "ocupada", platosListos: 1, segundosDesdeCambio: 600 }),
      mesa({ numero: "B", estado: "esperando_cuenta", segundosDesdeCambio: 60 }),
      mesa({ numero: "C", estado: "ocupada", platosListos: 3, segundosDesdeCambio: 120 }),
      mesa({ numero: "D", estado: "comiendo" }),
    ]);
    expect(orden.map((a) => a.mesa.numero)).toEqual(["B", "A", "C"]);
    expect(orden[0].motivo).toBe("cuenta");
    expect(orden[1].minutos).toBe(10);
  });
});

describe("ordenarMesas", () => {
  it("ordena por sector y por número real", () => {
    const o = ordenarMesas([
      { numero: "10", sector: "Salón", ordenSector: 1 },
      { numero: "2", sector: "Salón", ordenSector: 1 },
      { numero: "1", sector: "Terraza", ordenSector: 2 },
    ]);
    expect(o.map((m) => m.numero)).toEqual(["2", "10", "1"]);
  });
});

describe("carrito", () => {
  const pizza = { id: "p1", nombre: "Muzzarella", precio: 5000 };

  it("suma unidades del mismo producto en una sola línea", () => {
    let c = agregarAlCarrito([], pizza);
    c = agregarAlCarrito(c, pizza);
    expect(c).toHaveLength(1);
    expect(cantidadDe(c, "p1")).toBe(2);
    expect(totalCarrito(c)).toBe(10000);
    expect(unidadesCarrito(c)).toBe(2);
  });

  it("al restar hasta cero la línea desaparece", () => {
    const c = cambiarCantidad(agregarAlCarrito([], pizza), "p1", -1);
    expect(c).toEqual([]);
  });

  it("no pasa del máximo por línea", () => {
    let c = agregarAlCarrito([], pizza);
    c = cambiarCantidad(c, "p1", 100);
    expect(cantidadDe(c, "p1")).toBe(MAX_POR_LINEA);
  });

  it("guarda la nota de una línea", () => {
    const c = fijarNota(agregarAlCarrito([], pizza), "p1", "sin aceitunas");
    expect(c[0].notas).toBe("sin aceitunas");
  });
});
