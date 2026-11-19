import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { proxy } from "@/proxy";
import { permisoRequeridoApi, tienePermisoRuta } from "@/lib/auth/permiso-ruta";
import { ROLES_BASE } from "../prisma/roles-base";

const permisosDe = (id: string) => [...ROLES_BASE.find((r) => r.id === id)!.permisos];
const puede = (rol: string, metodo: string, ruta: string) => {
  const req = permisoRequeridoApi(ruta, metodo);
  return req === null || tienePermisoRuta(permisosDe(rol), req);
};

describe("permisos: segunda revisión (M4, M5, B2, B3)", () => {
  it("M4: todo /api/personal pide rrhh, salvo fichar, ver/ejecutar checklists (todo el personal)", () => {
    expect(permisoRequeridoApi("/api/personal/rendimiento", "GET")).toBe("rrhh:leer");
    expect(permisoRequeridoApi("/api/personal/fichaje", "GET")).toBe("rrhh:leer");
    expect(permisoRequeridoApi("/api/personal/checklists", "POST")).toBe("rrhh:crear");
    expect(permisoRequeridoApi("/api/personal/checklists/ejecuciones", "GET")).toBe("rrhh:leer");
    expect(permisoRequeridoApi("/api/personal/checklists/abc", "PUT")).toBe("rrhh:actualizar");
    expect(permisoRequeridoApi("/api/personal/otra-cosa-nueva", "GET")).toBe("rrhh:leer"); // por defecto cerrado
    expect(permisoRequeridoApi("/api/personal/fichaje", "POST")).toBeNull();
    expect(permisoRequeridoApi("/api/personal/checklists", "GET")).toBeNull();
    expect(permisoRequeridoApi("/api/personal/checklists/abc", "GET")).toBeNull();
    expect(permisoRequeridoApi("/api/personal/checklists/abc/ejecutar", "POST")).toBeNull();
  });

  it("M5: crear y borrar mesas piden mesas:crear / mesas:eliminar; el mozo cambia estados pero no borra", () => {
    expect(permisoRequeridoApi("/api/mesas", "POST")).toBe("mesas:crear");
    expect(permisoRequeridoApi("/api/mesas/abc", "DELETE")).toBe("mesas:eliminar");
    expect(permisoRequeridoApi("/api/mesas/abc", "PATCH")).toBe("mesas:actualizar");
    expect(puede("rol-mozo", "PATCH", "/api/mesas/abc")).toBe(true);
    expect(puede("rol-mozo", "POST", "/api/mesas")).toBe(false);
    expect(puede("rol-mozo", "DELETE", "/api/mesas/abc")).toBe(false);
    expect(puede("rol-gerente", "DELETE", "/api/mesas/abc")).toBe(true);
    expect(permisoRequeridoApi("/api/mozo/cuenta", "POST")).toBe("mesas:crear");
    expect(puede("rol-mozo", "GET", "/api/mozo/cuenta")).toBe(true);
  });

  it("B2/B3: sectores es de mesas; feedback e IA son de reportes", () => {
    expect(permisoRequeridoApi("/api/sectores", "GET")).toBe("mesas:leer");
    expect(permisoRequeridoApi("/api/sectores", "POST")).toBe("mesas:crear");
    expect(puede("rol-gerente", "POST", "/api/sectores")).toBe(true);
    expect(puede("rol-mozo", "POST", "/api/sectores")).toBe(false);
    expect(permisoRequeridoApi("/api/feedback/resumen", "GET")).toBe("reportes:leer");
    expect(permisoRequeridoApi("/api/ia/prediccion-stock", "GET")).toBe("reportes:leer");
    expect(puede("rol-mozo", "GET", "/api/ia/prediccion-ventas")).toBe(false);
  });
});

describe("B5: /api/v1 llega a su propia clave de API (el proxy no lo frena por falta de sesión)", () => {
  it("sin cookie ni Bearer de sesión el proxy lo deja pasar; la ruta exige X-API-Key", async () => {
    const res = await proxy(new NextRequest("http://localhost/api/v1/productos", { headers: { "x-api-key": "una-clave" } }));
    expect(res.status).toBe(200); // NextResponse.next(): no es un 401 del proxy
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("de punta a punta por el proxy: con clave válida responde, sin clave 401 de la ruta", async () => {
    process.env.API_V1_KEYS = JSON.stringify({ "clave-larga-de-prueba-1234567890": { tenantId: "11111111-1111-4111-8111-111111111111", scopes: ["productos:leer"] } });
    const { GET } = await import("@/app/api/v1/productos/route");
    const conClave = new NextRequest("http://localhost/api/v1/productos", { headers: { "x-api-key": "clave-larga-de-prueba-1234567890" } });
    expect((await proxy(conClave)).headers.get("x-middleware-next")).toBe("1");
    const sinClave = new NextRequest("http://localhost/api/v1/productos");
    expect((await proxy(sinClave)).headers.get("x-middleware-next")).toBe("1");
    expect((await GET(sinClave)).status).toBe(401);
    delete process.env.API_V1_KEYS;
  });

  it("un JWT de sesión no abre /api/v1 por sí solo (solo cuenta la clave)", async () => {
    const token = await new SignJWT({ userId: "u", tenantId: "t", email: "a@b.c", roles: [], permisos: ["*"] })
      .setProtectedHeader({ alg: "HS256" }).setExpirationTime("10m").sign(new TextEncoder().encode(process.env.JWT_SECRET!));
    const { GET } = await import("@/app/api/v1/productos/route");
    const req = new NextRequest("http://localhost/api/v1/productos", { headers: { cookie: `token=${token}` } });
    expect((await GET(req)).status).toBe(401);
  });
});
