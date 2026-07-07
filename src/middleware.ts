import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN Y RBAC
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || "tu-secreto-super-seguro-cambiar-en-produccion";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  permisos: string[];
}

// Rutas públicas (no requieren auth)
const PUBLIC_ROUTES = [
  "/",
  "/menu",
  "/api/auth/login",
  "/api/auth/register",
  "/api/productos/publico",
  "/api/reservas",
];

// Rutas que requieren solo tenant (sin auth estricta)
const TENANT_ROUTES = [
  "/[tenant]/[mesa]",
];

// Verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.includes("[")) {
      // Convertir patrón a regex
      const regex = new RegExp("^" + route.replace(/\[.*?\]/g, "[^/]+") + "$");
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

// Extraer token del header o cookie
function extractToken(request: NextRequest): string | null {
  // Intentar Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Intentar cookie
  const tokenCookie = request.cookies.get("token")?.value;
  if (tokenCookie) {
    return tokenCookie;
  }

  return null;
}

// Verificar y decodificar JWT
function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verificar si el usuario tiene permiso
function hasPermission(userPermios: string[], requiredPermiso: string): boolean {
  // Admin tiene todos los permisos
  if (userPermios.includes("*")) return true;

  // Verificar permiso exacto
  if (userPermios.includes(requiredPermiso)) return true;

  // Verificar permiso wildcard (ej: "pedidos:*" cubre "pedidos:crear")
  const [recurso, accion] = requiredPermiso.split(":");
  if (userPermios.includes(`${recurso}:*`)) return true;

  return false;
}

// Mapear rutas a permisos requeridos
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard": "dashboard:leer",
  "/dashboard/cocina": "kds:leer",
  "/dashboard/barra": "kds:leer",
  "/dashboard/pedidos": "pedidos:leer",
  "/dashboard/caja": "caja:leer",
  "/dashboard/reservas": "reservas:leer",
  "/dashboard/inventario": "inventario:leer",
  "/dashboard/compras": "compras:leer",
  "/dashboard/rrhh": "rrhh:leer",
  "/dashboard/marketing": "marketing:leer",
  "/dashboard/bi": "bi:leer",
  "/api/mesas": "mesas:leer",
  "/api/pedidos": "pedidos:leer",
  "/api/reservas": "reservas:leer",
  "/api/dashboard/resumen": "dashboard:leer",
};

// Obtener permiso requerido para una ruta
function getRequiredPermission(pathname: string): string | null {
  // Buscar coincidencia exacta
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Buscar coincidencia por prefijo
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + "/")) {
      return permission;
    }
  }

  return null;
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir rutas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Permitir archivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Extraer y verificar token
  const token = extractToken(request);

  if (!token) {
    // Si es API, retornar 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Token de autenticación requerido" },
        { status: 401 }
      );
    }

    // Si es página, redirigir a login
    const loginUrl = new URL("/api/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Decodificar token
  const payload = verifyToken(token);

  if (!payload) {
    // Token inválido
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/api/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Verificar permisos para la ruta
  const requiredPermission = getRequiredPermission(pathname);

  if (requiredPermission && !hasPermission(payload.permisos, requiredPermission)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a este recurso" },
        { status: 403 }
      );
    }

    // Redirigir a dashboard sin permiso
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 6. Agregar headers de seguridad
  const response = NextResponse.next();

  // Headers de seguridad
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Información del usuario (para el cliente)
  response.headers.set("X-User-Id", payload.userId);
  response.headers.set("X-Tenant-Id", payload.tenantId);
  response.headers.set("X-User-Roles", payload.roles.join(","));

  return response;
}

// Configurar rutas que usa el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
