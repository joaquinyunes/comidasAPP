import { describe, it, expect, afterEach, vi } from "vitest";
import { codigoQrValido, codigoLocalEsperado } from "@/lib/qr-local";

afterEach(() => vi.unstubAllEnvs());

describe("código QR del local", () => {
  it("usa QR_LOCAL_CODIGO (de servidor) y compara en tiempo constante", () => {
    vi.stubEnv("QR_LOCAL_CODIGO", "secreto-del-local");
    vi.stubEnv("NEXT_PUBLIC_QR_LOCAL_CODIGO", "");
    expect(codigoQrValido("secreto-del-local")).toBe(true);
    expect(codigoQrValido("secreto-del-locaL")).toBe(false);
    expect(codigoQrValido("corto")).toBe(false);
    expect(codigoQrValido("")).toBe(false);
    expect(codigoQrValido(null)).toBe(false);
  });
  it("sin ningún código configurado nunca valida (ni siquiera con vacío)", () => {
    vi.stubEnv("QR_LOCAL_CODIGO", "");
    vi.stubEnv("NEXT_PUBLIC_QR_LOCAL_CODIGO", "");
    expect(codigoLocalEsperado()).toBe("");
    expect(codigoQrValido("")).toBe(false);
    expect(codigoQrValido("x")).toBe(false);
  });
  it("la variable de servidor tiene prioridad sobre la vieja", () => {
    vi.stubEnv("QR_LOCAL_CODIGO", "nuevo");
    vi.stubEnv("NEXT_PUBLIC_QR_LOCAL_CODIGO", "viejo");
    expect(codigoQrValido("nuevo")).toBe(true);
    expect(codigoQrValido("viejo")).toBe(false);
  });
});
