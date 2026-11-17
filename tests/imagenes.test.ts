import { describe, it, expect } from "vitest";
import { patronesImagenes } from "@/config/imagenes";

describe("orígenes de imágenes permitidos", () => {
  it("vacío o sin definir: ningún origen externo", () => {
    expect(patronesImagenes(undefined)).toEqual([]);
    expect(patronesImagenes("")).toEqual([]);
  });
  it("acepta dominios y subdominios con *. y siempre por https", () => {
    expect(patronesImagenes("fotos.resto.com, *.supabase.co")).toEqual([
      { protocol: "https", hostname: "fotos.resto.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ]);
  });
  it("descarta comodines peligrosos y basura (**, *, localhost, IPs con puerto, rutas)", () => {
    expect(patronesImagenes("**, *, localhost, 10.0.0.1:3000, evil.com/x, *.com")).toEqual([{ protocol: "https", hostname: "*.com" }].slice(0, 0));
  });
});
