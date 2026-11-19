import { describe, it, expect } from "vitest";
import { validarCobro } from "@/lib/pedidos/validar-cobro";

const base = { total: 1000, cobrado: 0, propina: 0 };

describe("validarCobro", () => {
  it("cobro exacto del saldo: ok y salda", () => {
    expect(validarCobro({ ...base, monto: 1000 })).toMatchObject({ ok: true, salda: true, consumo: 1000 });
  });

  it("la propina no cuenta como consumo", () => {
    expect(validarCobro({ ...base, monto: 1100, propina: 100 })).toMatchObject({ ok: true, salda: true, consumo: 1000 });
  });

  it("no deja cobrar de más", () => {
    expect(validarCobro({ ...base, monto: 1500 })).toMatchObject({ ok: false, codigo: "EXCEDE_SALDO", status: 409 });
  });

  it("no deja cobrar de menos sin declararlo parcial", () => {
    expect(validarCobro({ ...base, monto: 400 })).toMatchObject({ ok: false, codigo: "MONTO_MENOR_AL_SALDO", status: 422 });
  });

  it("parcial sin motivo se rechaza; con motivo pasa y no salda", () => {
    expect(validarCobro({ ...base, monto: 400, parcial: true })).toMatchObject({ ok: false, codigo: "PARCIAL_SIN_MOTIVO" });
    expect(validarCobro({ ...base, monto: 400, parcial: true, motivo: "  " })).toMatchObject({ ok: false, codigo: "PARCIAL_SIN_MOTIVO" });
    expect(validarCobro({ ...base, monto: 400, parcial: true, motivo: "divide la cuenta" })).toMatchObject({ ok: true, salda: false, saldoAntes: 1000 });
  });

  it("el saldo descuenta lo ya cobrado", () => {
    expect(validarCobro({ total: 1000, cobrado: 400, monto: 600, propina: 0 })).toMatchObject({ ok: true, salda: true, saldoAntes: 600 });
    expect(validarCobro({ total: 1000, cobrado: 400, monto: 1000, propina: 0 })).toMatchObject({ ok: false, codigo: "EXCEDE_SALDO" });
  });

  it("saldo en cero: ya estaba pagado", () => {
    expect(validarCobro({ total: 1000, cobrado: 1000, monto: 1000, propina: 0 })).toEqual({ ok: false, codigo: "YA_PAGADO" });
  });

  it("propina mayor al consumo o monto que no cubre la propina: se rechaza", () => {
    expect(validarCobro({ ...base, monto: 100, propina: 100 })).toMatchObject({ ok: false, codigo: "PROPINA_INVALIDA" });
    expect(validarCobro({ ...base, monto: 1000, propina: 1500 })).toMatchObject({ ok: false, codigo: "PROPINA_INVALIDA" });
  });

  it("tolera un centavo de redondeo", () => {
    expect(validarCobro({ total: 100.01, cobrado: 0, monto: 100, propina: 0 })).toMatchObject({ ok: true, salda: true });
  });
});
