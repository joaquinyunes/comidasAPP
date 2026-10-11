import { describe, it, expect } from "vitest";
import { rolPanel } from "@/lib/panel/rol-panel";
import { itemsVisibles, agruparItems, estaActivo } from "@/components/panel/shell/filtrar-nav";

describe("rolPanel", () => {
  it("administrador y gerente conducen el local", () => {
    expect(rolPanel({ roles: ["Administrador"], permisos: ["*"] })).toBe("jefe");
    expect(rolPanel({ roles: ["Gerente"], permisos: ["pedidos:*", "reportes:leer"] })).toBe("jefe");
  });

  it("cada rol de piso cae en su pantalla", () => {
    expect(rolPanel({ roles: ["Mozo"], permisos: ["pedidos:crear", "mesas:leer"] })).toBe("mozo");
    expect(rolPanel({ roles: ["Cocinero"], permisos: ["pedidos:leer"] })).toBe("cocina");
    expect(rolPanel({ roles: ["Barman"], permisos: ["pedidos:leer"] })).toBe("cocina");
    expect(rolPanel({ roles: ["Cajero"], permisos: ["caja:*", "pagos:*"] })).toBe("caja");
  });

  it("un rol a medida se deduce de sus permisos", () => {
    expect(rolPanel({ roles: ["Encargado de turno"], permisos: ["caja:leer"] })).toBe("caja");
    expect(rolPanel({ roles: ["Runner"], permisos: ["mesas:leer"] })).toBe("mozo");
    expect(rolPanel({ roles: ["Ayudante"], permisos: ["pedidos:leer"] })).toBe("cocina");
  });
});

describe("navegación", () => {
  it("el mozo no ve gestión ni análisis", () => {
    const items = itemsVisibles(["pedidos:crear", "pedidos:leer", "mesas:leer", "reservas:leer"]);
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain("/dashboard/mozo");
    expect(hrefs).not.toContain("/dashboard/inventario");
    expect(hrefs).not.toContain("/dashboard/reportes");
    expect(agruparItems(items).map((g) => g.grupo)).not.toContain("analisis");
  });

  it("el administrador ve todo", () => {
    expect(itemsVisibles(["*"]).length).toBeGreaterThan(15);
  });

  it("el inicio solo se marca activo en su ruta exacta", () => {
    expect(estaActivo("/dashboard", "/dashboard")).toBe(true);
    expect(estaActivo("/dashboard", "/dashboard/caja")).toBe(false);
    expect(estaActivo("/dashboard/caja", "/dashboard/caja")).toBe(true);
  });
});
