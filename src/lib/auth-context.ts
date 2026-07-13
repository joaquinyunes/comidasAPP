import { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "tu-secreto-super-seguro-cambiar-en-produccion";

export interface TenantContext {
  tenantId: string;
  sucursalId?: string;
  usuarioId: string;
  roles: string[];
  permisos: string[];
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const tokenCookie = request.cookies.get("token")?.value;
  if (tokenCookie) {
    return tokenCookie;
  }

  return null;
}

function verifyToken(token: string): TenantContext | null {
  try {
    const decoded = verify(token, JWT_SECRET) as Record<string, unknown> & TenantContext;
    return {
      tenantId: decoded.tenantId as string,
      sucursalId: decoded.sucursalId as string | undefined,
      usuarioId: (decoded.usuarioId as string) ?? (decoded.userId as string),
      roles: (decoded.roles as string[]) ?? [],
      permisos: (decoded.permisos as string[]) ?? [],
    };
  } catch {
    return null;
  }
}

export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
  const token = extractToken(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verificar que el usuario sigue activo
  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.usuarioId },
    select: { id: true, activo: true, tenantId: true },
  });

  if (!usuario || !usuario.activo || usuario.tenantId !== payload.tenantId) {
    return null;
  }

  return payload;
}

// Middleware helper para rutas que requieren permisos específicos
export function requirePermission(permisosRequeridos: string | string[]) {
  const permisos = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos];

  return (context: TenantContext | null): NextResponse | null => {
    if (!context) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const tienePermiso = permisos.some((p) => {
      if (context.permisos.includes("*")) return true;
      if (context.permisos.includes(p)) return true;
      const [recurso] = p.split(":");
      if (context.permisos.includes(`${recurso}:*`)) return true;
      return false;
    });

    if (!tienePermiso) {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    return null;
  };
}

// Import NextResponse at top level
import { NextResponse } from "next/server";