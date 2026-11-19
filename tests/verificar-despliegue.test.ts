import { describe, it, expect } from "vitest";
import { evaluarVariables, evaluarMigraciones } from "../scripts/verificar-despliegue.mjs";

const bueno = {
  DATABASE_URL: "postgresql://u:p@db.ejemplo.com:5432/app",
  JWT_SECRET: "Zq8vK2mXp9LrT4wYc7NbH1sDf6GjA3eU5oIkRtQy0VxW",
  MERCADOPAGO_WEBHOOK_SECRET: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
  QR_LOCAL_CODIGO: "k9Tq2LmX7",
  MERCADOPAGO_ACCESS_TOKEN: "APP_USR-123456-abcdef",
};
const falla = (env: Record<string, string>) => evaluarVariables(env).filter((r) => !r.ok && r.nivel === "error").map((r) => r.nombre);

describe("verificar-despliegue: variables", () => {
  it("todo en orden: ningún error", () => {
    expect(falla(bueno)).toEqual([]);
  });
  it("cada variable obligatoria que falta se marca", () => {
    for (const k of Object.keys(bueno)) {
      const { [k]: _quitada, ...resto } = bueno as Record<string, string>;
      expect(falla(resto).length, k).toBe(1);
    }
  });
  it("JWT_SECRET débil (corto, repetitivo o de ejemplo) se rechaza", () => {
    for (const j of ["corto", "a".repeat(40), "cambiar-en-produccion-min-32-caracteres"]) expect(falla({ ...bueno, JWT_SECRET: j })).toContain("JWT_SECRET fuerte");
  });
  it("QR con el valor de ejemplo se rechaza", () => {
    expect(falla({ ...bueno, QR_LOCAL_CODIGO: "cambiar-en-produccion" })).toContain("QR_LOCAL_CODIGO");
  });
  it("NEXT_PUBLIC_QR_LOCAL_CODIGO definida es un error", () => {
    expect(falla({ ...bueno, NEXT_PUBLIC_QR_LOCAL_CODIGO: "x" })).toEqual(["sin NEXT_PUBLIC_QR_LOCAL_CODIGO"]);
  });
  it("token de prueba de Mercado Pago: solo aviso, no error", () => {
    const r = evaluarVariables({ ...bueno, MERCADOPAGO_ACCESS_TOKEN: "TEST-123" });
    expect(r.some((x) => !x.ok && x.nivel === "aviso")).toBe(true);
    expect(falla({ ...bueno, MERCADOPAGO_ACCESS_TOKEN: "TEST-123" })).toEqual([]);
  });
  it("no filtra valores secretos en los detalles", () => {
    const texto = JSON.stringify(evaluarVariables({ ...bueno, JWT_SECRET: "corto-secreto-123", NEXT_PUBLIC_QR_LOCAL_CODIGO: "valor-publico-xyz" }));
    expect(texto).not.toContain("corto-secreto-123");
    expect(texto).not.toContain("valor-publico-xyz");
  });
});

describe("verificar-despliegue: migraciones", () => {
  const carpetas = ["0001_a", "0002_b", "0007_c"];
  it("todas aplicadas: ok", () => {
    expect(evaluarMigraciones(carpetas, [...carpetas])[0].ok).toBe(true);
  });
  it("faltan algunas: las nombra", () => {
    const [r] = evaluarMigraciones(carpetas, ["0001_a"]);
    expect(r.ok).toBe(false);
    expect(r.detalle).toContain("0002_b");
    expect(r.detalle).toContain("0007_c");
  });
});
