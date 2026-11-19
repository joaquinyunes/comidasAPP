import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { proxy } from "@/proxy";
import { ROLES_BASE } from "../prisma/roles-base";

// El proxy es la puerta de TODA la API: con el rol mozo/cocinero las rutas sensibles dan 403.
const firmar = (permisos: string[]) =>
  new SignJWT({ userId: "u", tenantId: "t", email: "a@b.c", roles: ["x"], permisos })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

const permisosDe = (id: string) => [...ROLES_BASE.find((r) => r.id === id)!.permisos];
const llamar = async (rol: string, metodo: string, ruta: string) => {
  const token = await firmar(permisosDe(rol));
  const res = await proxy(new NextRequest("http://localhost" + ruta, { method: metodo, headers: { cookie: `token=${token}` } }));
  return res.status; // NextResponse.next() devuelve 200
};

describe("proxy: autorización por rol y método", () => {
  it.each([
    ["rol-mozo", "POST", "/api/pagos"],
    ["rol-mozo", "GET", "/api/audit"],
    ["rol-mozo", "PATCH", "/api/marketing/cupones/1"],
    ["rol-mozo", "POST", "/api/compras/ordenes"],
    ["rol-mozo", "GET", "/api/rrhh/empleados"],
    ["rol-mozo", "GET", "/api/dueno/control-operativo"],
    ["rol-cocinero", "POST", "/api/pagos"],
    ["rol-cocinero", "POST", "/api/inventario/movimientos"],
    ["rol-cajero", "POST", "/api/compras/ordenes"],
    ["rol-gerente", "GET", "/api/audit"],
    ["rol-mozo", "GET", "/api/personal/rendimiento"],
    ["rol-mozo", "POST", "/api/personal/fichaje"],
    ["rol-cocinero", "GET", "/api/feedback/resumen"],
    ["rol-cocinero", "GET", "/api/ia/prediccion-stock"],
    ["rol-mozo", "POST", "/api/sectores"],
    ["rol-cajero", "GET", "/api/ia/prediccion-ventas"],
  ])("%s %s %s → 403", async (rol, metodo, ruta) => {
    expect(await llamar(rol, metodo, ruta)).toBe(403);
  });

  it.each([
    ["rol-mozo", "POST", "/api/pedidos"],
    ["rol-mozo", "PUT", "/api/pedidos/abc"],
    ["rol-cocinero", "POST", "/api/cocina/items"],
    ["rol-cajero", "POST", "/api/pagos"],
    ["rol-gerente", "POST", "/api/compras/ordenes"],
    ["rol-admin", "GET", "/api/audit"],
    ["rol-mozo", "GET", "/api/auth/me"],
    ["rol-mozo", "POST", "/api/personal/checklists/abc/ejecutar"],
    ["rol-gerente", "GET", "/api/feedback/resumen"],
    ["rol-admin", "POST", "/api/sectores"],
  ])("%s %s %s → pasa", async (rol, metodo, ruta) => {
    expect(await llamar(rol, metodo, ruta)).toBe(200);
  });

  it("sin sesión: 401", async () => {
    const res = await proxy(new NextRequest("http://localhost/api/pagos", { method: "POST" }));
    expect(res.status).toBe(401);
  });
});
