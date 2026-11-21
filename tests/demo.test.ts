import { describe, it, expect, afterEach, vi } from "vitest";
import { esBaseDeDemo, esModoDemo } from "@/lib/demo";

afterEach(() => vi.unstubAllEnvs());

describe("entorno de demo", () => {
  it("una base de demo es local o dice «demo» en el nombre o el host", () => {
    expect(esBaseDeDemo("postgresql://u:p@localhost:5432/x")).toBe(true);
    expect(esBaseDeDemo("postgresql://u:p@db.abc.supabase.co:5432/cozizina-demo")).toBe(true);
    expect(esBaseDeDemo("postgresql://u:p@demo-db.example.com:5432/x")).toBe(true);
  });
  it("la base real o inválida NO es de demo", () => {
    expect(esBaseDeDemo("postgresql://u:p@db.abc.supabase.co:5432/postgres")).toBe(false);
    expect(esBaseDeDemo(undefined)).toBe(false);
    expect(esBaseDeDemo("no-es-url")).toBe(false);
  });
  it("DEMO_MODE=1 activa el modo; cualquier otra cosa, no", () => {
    vi.stubEnv("DEMO_MODE", "1");
    expect(esModoDemo()).toBe(true);
    vi.stubEnv("DEMO_MODE", "true");
    expect(esModoDemo()).toBe(false);
  });
});
