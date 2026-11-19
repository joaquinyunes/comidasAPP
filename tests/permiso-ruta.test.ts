import { describe, it, expect } from "vitest";
import { permisoRequeridoApi, tienePermisoRuta } from "@/lib/auth/permiso-ruta";
import { ROLES_BASE } from "../prisma/roles-base";

const permisosDe = (id: string) => [...ROLES_BASE.find((r) => r.id === id)!.permisos];
const MOZO = permisosDe("rol-mozo");
const COCINERO = permisosDe("rol-cocinero");
const CAJERO = permisosDe("rol-cajero");
const GERENTE = permisosDe("rol-gerente");
const ADMIN = permisosDe("rol-admin");

const puede = (permisos: string[], metodo: string, ruta: string) => {
  const req = permisoRequeridoApi(ruta, metodo);
  return req === null || tienePermisoRuta(permisos, req);
};

describe("permiso requerido por ruta y método (revisión independiente, hallazgo ALTA)", () => {
  it("el método define la acción: GET leer, POST crear, PUT/PATCH actualizar, DELETE eliminar", () => {
    expect(permisoRequeridoApi("/api/pagos", "GET")).toBe("pagos:leer");
    expect(permisoRequeridoApi("/api/pagos", "POST")).toBe("pagos:crear");
    expect(permisoRequeridoApi("/api/pedidos/abc", "PUT")).toBe("pedidos:actualizar");
    expect(permisoRequeridoApi("/api/compras/ordenes", "DELETE")).toBe("compras:eliminar");
  });

  it("rutas sin regla (auth, públicas, personal) siguen pidiendo solo sesión", () => {
    for (const r of ["/api/auth/me", "/api/personal/checklists/abc/ejecutar"]) expect(permisoRequeridoApi(r, "POST")).toBeNull();
    expect(permisoRequeridoApi("/api/personal/checklists", "GET")).toBeNull();
    expect(permisoRequeridoApi("/api/personal/checklists/abc", "GET")).toBeNull();
  });

  it("el mozo y el cocinero NO pueden cobrar, ni tocar compras, cupones, RRHH, auditoría, dueño ni inventario", () => {
    for (const rol of [MOZO, COCINERO]) {
      expect(puede(rol, "POST", "/api/pagos")).toBe(false);
      expect(puede(rol, "POST", "/api/compras/ordenes")).toBe(false);
      expect(puede(rol, "PATCH", "/api/marketing/cupones/1")).toBe(false);
      expect(puede(rol, "POST", "/api/rrhh/empleados")).toBe(false);
      expect(puede(rol, "GET", "/api/rrhh/empleados")).toBe(false);
      expect(puede(rol, "GET", "/api/audit")).toBe(false);
      expect(puede(rol, "POST", "/api/audit")).toBe(false);
      expect(puede(rol, "GET", "/api/dueno/control-operativo")).toBe(false);
      expect(puede(rol, "POST", "/api/inventario/movimientos")).toBe(false);
    }
  });

  it("personal, feedback, IA y sectores piden permiso por rol (mozo y cocinero → 403)", () => {
    const cerradas: [string, string][] = [
      ["GET", "/api/personal/fichaje"], ["POST", "/api/personal/fichaje"], ["GET", "/api/personal/rendimiento"],
      ["POST", "/api/personal/checklists"], ["GET", "/api/personal/checklists/ejecuciones"],
      ["GET", "/api/feedback/resumen"], ["GET", "/api/ia/prediccion-stock"], ["GET", "/api/ia/prediccion-ventas"],
      ["GET", "/api/sectores"], ["POST", "/api/sectores"],
    ];
    for (const rol of [MOZO, COCINERO, CAJERO]) for (const [met, ruta] of cerradas) expect(puede(rol, met, ruta), `${met} ${ruta}`).toBe(false);
    expect(puede(GERENTE, "GET", "/api/feedback/resumen")).toBe(true);
    expect(puede(GERENTE, "GET", "/api/ia/prediccion-stock")).toBe(true);
    expect(puede(GERENTE, "POST", "/api/sectores")).toBe(false);
    for (const [met, ruta] of cerradas) expect(puede(ADMIN, met, ruta)).toBe(true);
    // lo que hace cada persona con su trabajo sigue abierto
    expect(puede(MOZO, "GET", "/api/personal/checklists")).toBe(true);
    expect(puede(MOZO, "POST", "/api/personal/checklists/abc/ejecutar")).toBe(true);
  });

  it("el mozo sí hace su trabajo: pedidos, mesas, salón, carta (disponibilidad)", () => {
    expect(puede(MOZO, "POST", "/api/pedidos")).toBe(true);
    expect(puede(MOZO, "PUT", "/api/pedidos/abc")).toBe(true);
    expect(puede(MOZO, "PUT", "/api/mesas/1")).toBe(true);
    expect(puede(MOZO, "GET", "/api/salon/estado")).toBe(true);
    expect(puede(MOZO, "PATCH", "/api/carta/abc")).toBe(true);
  });

  it("cocina: actualizar comandas sí; el delivery se maneja con permiso de pedidos", () => {
    expect(puede(COCINERO, "POST", "/api/cocina/items")).toBe(true);
    expect(puede(COCINERO, "POST", "/api/delivery/asignar")).toBe(true);
  });

  it("cajero cobra y ve caja; gerente y admin hacen lo suyo; admin todo", () => {
    expect(puede(CAJERO, "POST", "/api/pagos")).toBe(true);
    expect(puede(CAJERO, "GET", "/api/caja/resumen")).toBe(true);
    expect(puede(CAJERO, "POST", "/api/compras/ordenes")).toBe(false);
    expect(puede(GERENTE, "POST", "/api/pagos")).toBe(true);
    expect(puede(GERENTE, "POST", "/api/inventario/movimientos")).toBe(true);
    expect(puede(GERENTE, "POST", "/api/compras/ordenes")).toBe(true);
    expect(puede(GERENTE, "GET", "/api/audit")).toBe(false);
    for (const r of ["/api/audit", "/api/rrhh/turnos", "/api/dueno/x", "/api/marketing/cupones"]) expect(puede(ADMIN, "POST", r)).toBe(true);
  });

  it("comodines: 'recurso:*' y '*'", () => {
    expect(tienePermisoRuta(["pagos:*"], "pagos:crear")).toBe(true);
    expect(tienePermisoRuta(["*"], "audit:crear")).toBe(true);
    expect(tienePermisoRuta(["pagos:leer"], "pagos:crear")).toBe(false);
  });
});
