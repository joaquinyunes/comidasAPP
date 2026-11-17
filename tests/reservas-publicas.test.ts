import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { reserva: { create: vi.fn().mockResolvedValue({ id: "r" }) } },
  getTenantBySlug: async () => ({ id: "t" }),
  getDefaultSucursal: async () => ({ id: "s" }),
}));

import { POST } from "@/app/api/publico/reservas/route";

const base = { nombre: "Ana Pérez", telefono: "1155551234", fecha: "2026-12-24", hora: "21:00", cantidadPersonas: 4 };
let n = 0;
const reservar = (extra: object) =>
  POST(
    new Request("http://x/api/publico/reservas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `8.8.${++n}.1` },
      body: JSON.stringify({ ...base, ...extra }),
    }) as never
  );

describe("reservas públicas: largos y formatos máximos", () => {
  it("una reserva normal pasa", async () => {
    expect((await reservar({})).status).toBeLessThan(300);
  });
  it.each([
    ["nombre larguísimo", { nombre: "x".repeat(101) }],
    ["teléfono larguísimo", { telefono: "1".repeat(31) }],
    ["notas de 10 mil caracteres", { notas: "n".repeat(10_000) }],
    ["fecha en cualquier formato", { fecha: "mañana a la noche" }],
    ["hora inválida", { hora: "25 hs" }],
    ["email enorme", { email: "a".repeat(250) + "@x.com" }],
  ])("%s → 400", async (_n, extra) => {
    expect((await reservar(extra)).status).toBe(400);
  });
});
