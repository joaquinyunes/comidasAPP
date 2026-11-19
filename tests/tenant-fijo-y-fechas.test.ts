import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({ slugs: [] as string[], reservaCreate: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reserva: { create: m.reservaCreate },
    categoriaMenu: { findMany: async () => [] },
    mesa: { findMany: async () => [] },
    promocion: { findMany: async () => [] },
    feedback: { findMany: async () => [] },
    campana: { findMany: async () => [] },
    zonaReparto: { findMany: async () => [] },
  },
  getTenantBySlug: async (slug: string) => (m.slugs.push(slug), { id: "t", nombre: "N", slug }),
  getDefaultSucursal: async () => ({ id: "s", nombre: "S" }),
}));

import { POST as reservar } from "@/app/api/publico/reservas/route";
import { GET as zonas } from "@/app/api/publico/zonas/route";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";
import { fechaValida, horaValida } from "@/lib/reservas/fecha-hora";

let n = 0;
const post = (body: object) =>
  reservar(new Request("http://x/api/publico/reservas", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `9.9.${++n}.1` }, body: JSON.stringify(body) }) as never);
const base = { nombre: "Ana Pérez", telefono: "1155551234", fecha: "2026-12-24", hora: "21:00", cantidadPersonas: 4 };

beforeEach(() => {
  m.slugs = [];
  m.reservaCreate.mockReset().mockResolvedValue({ id: "r" });
});

describe("B11: el restaurante lo define el servidor (TENANT_SLUG), no el visitante", () => {
  it("reservas públicas ignoran el tenant que mande el cuerpo", async () => {
    expect((await post({ ...base, tenant: "restaurante-ajeno" })).status).toBe(201);
    expect(m.slugs).toEqual([SITE_TENANT_SLUG]);
  });
  it("zonas públicas ignoran ?tenant=", async () => {
    await zonas();
    expect(m.slugs).toEqual([SITE_TENANT_SLUG]);
  });
});

describe("B11: horas y fechas imposibles se rechazan con 400 (antes: Invalid Date → 500)", () => {
  it.each([["hora 99:99", { hora: "99:99" }], ["hora 24:00", { hora: "24:00" }], ["minutos 12:75", { hora: "12:75" }], ["fecha 2026-02-31", { fecha: "2026-02-31" }], ["fecha 2026-13-01", { fecha: "2026-13-01" }]])(
    "%s",
    async (_n, extra) => {
      expect((await post({ ...base, ...extra })).status).toBe(400);
      expect(m.reservaCreate).not.toHaveBeenCalled();
    }
  );
  it("funciones puras", () => {
    expect(horaValida("00:00")).toBe(true);
    expect(horaValida("23:59")).toBe(true);
    expect(horaValida("23:59:30")).toBe(true);
    expect(horaValida("24:00")).toBe(false);
    expect(fechaValida("2028-02-29")).toBe(true);
    expect(fechaValida("2027-02-29")).toBe(false);
  });
});
