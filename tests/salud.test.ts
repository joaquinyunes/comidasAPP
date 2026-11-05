import { describe, it, expect, vi, beforeEach } from "vitest";

const consulta = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: consulta } }));

import { GET } from "@/app/api/salud/route";

describe("GET /api/salud", () => {
  beforeEach(() => {
    consulta.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("base respondiendo: 200 y ok", async () => {
    consulta.mockResolvedValue([{ "?column?": 1 }]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("base caída: 503 sin detalles del error", async () => {
    consulta.mockRejectedValue(new Error("password authentication failed for user x"));
    const res = await GET();
    expect(res.status).toBe(503);
    const texto = JSON.stringify(await res.json());
    expect(texto).toBe('{"ok":false}');
  });
});
