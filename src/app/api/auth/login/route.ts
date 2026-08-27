import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";

// ============================================
// POST /api/auth/login — iniciar sesión
// DELETE /api/auth/login — cerrar sesión
// (el alta de usuarios vive en /api/auth/register)
// ============================================

const JWT_SECRET =
  process.env.JWT_SECRET || "tu-secreto-super-seguro-cambiar-en-produccion";

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña demasiado corta"),
});

const COOKIE_OPCIONES = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24,
  path: "/",
};

export async function POST(request: NextRequest) {
  try {
    const limitada = await authRateLimit(request);
    if (limitada) return limitada;

    const body = await request.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.usuario.findFirst({
      where: { email },
      include: { usuarioRoles: { include: { rol: true } } },
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    if (!user.activo) {
      return NextResponse.json({ error: "Usuario desactivado" }, { status: 403 });
    }

    const roles = user.usuarioRoles.map((ur) => ur.rol.nombre);
    const permisos = user.usuarioRoles.flatMap((ur) => ur.rol.permisos as string[]);

    const token = sign(
      { userId: user.id, tenantId: user.tenantId, email: user.email, roles, permisos },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, nombre: user.nombre, roles },
    });
    response.cookies.set("token", token, COOKIE_OPCIONES);
    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
