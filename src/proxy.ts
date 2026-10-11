import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";

// ============================================
// PROXY — Autenticación y RBAC
// (antes middleware.ts; renombrado en Next 16)
//
// Modelo: solo se protege lo que lo necesita. El resto (sitio
// público, rutas inexistentes) pasa de largo y Next resuelve
// (o devuelve 404).
// ============================================

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  permisos: string[];
}

// APIs que NO requieren sesión (sitio cara-al-cliente + webhooks).
const API_PUBLICAS = [
  "/api/auth",
  "/api/publico",
  "/api/cliente",
  "/api/pagos/mercadopago/webhook",
];

function requiereSesion(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/api/")) {
    return !API_PUBLICAS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  }
  return false;
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  return request.cookies.get("token")?.value ?? null;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

function hasPermission(permisos: string[], requerido: string): boolean {
  if (permisos.includes("*")) return true;
  if (permisos.includes(requerido)) return true;
  const [recurso] = requerido.split(":");
  return permisos.includes(`${recurso}:*`);
}

// Permiso por sección. El home del dashboard no pide nada (cualquier
// usuario autenticado entra) para evitar loops de redirect.
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard/pedidos": "pedidos:leer",
  "/dashboard/cocina": "pedidos:leer",
  "/dashboard/caja": "caja:leer",
  "/dashboard/reservas": "reservas:leer",
  "/dashboard/mesas": "mesas:leer",
  "/dashboard/mozo": "mesas:leer",
  "/dashboard/inventario": "inventario:leer",
  "/dashboard/compras": "compras:leer",
  "/dashboard/crm": "clientes:leer",
  "/dashboard/rrhh": "rrhh:leer",
  "/dashboard/personal": "rrhh:leer",
  "/dashboard/marketing": "marketing:leer",
  "/dashboard/delivery": "pedidos:leer",
  "/dashboard/reportes": "reportes:leer",
  "/dashboard/bi": "reportes:leer",
  "/dashboard/dueno": "reportes:leer",
  "/dashboard/feedback": "reportes:leer",
  "/dashboard/fidelizacion": "clientes:leer",
  "/dashboard/configuracion": "config:leer",
  "/api/caja": "caja:leer",
  "/api/salon": "mesas:leer",
  "/api/cocina": "pedidos:leer",
  "/api/reservas": "reservas:leer",
  "/api/inventario": "inventario:leer",
};

function getRequiredPermission(pathname: string): string | null {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  for (const [route, permiso] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + "/")) return permiso;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!requiereSesion(pathname)) return NextResponse.next();

  const esApi = pathname.startsWith("/api/");
  const token = extractToken(request);

  if (!token) {
    if (esApi) return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (esApi) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requerido = getRequiredPermission(pathname);
  if (requerido && !hasPermission(payload.permisos, requerido)) {
    if (esApi) return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
