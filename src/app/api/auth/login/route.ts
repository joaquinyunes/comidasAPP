import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash, compare } from "bcryptjs";

// ============================================
// SCHEMA DE VALIDACIÓN
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || "tu-secreto-super-seguro-cambiar-en-produccion";

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "Nombre requerido").max(100),
  tenantId: z.string().uuid("ID de tenant inválido"),
});

// ============================================
// POST /api/auth/login
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathname } = request.nextUrl;

    const isRegister = pathname.includes("register");

    // ============================================
    // REGISTRO
    // ============================================
    if (isRegister) {
      const validation = RegisterSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Datos inválidos", details: validation.error.issues },
          { status: 400 }
        );
      }

      const { email, password, nombre, tenantId } = validation.data;

      const existingUser = await prisma.usuario.findFirst({
        where: { email, tenantId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 409 }
        );
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return NextResponse.json(
          { error: "Tenant no encontrado" },
          { status: 404 }
        );
      }

      const passwordHash = await hash(password, 12);

      const user = await prisma.usuario.create({
        data: {
          tenantId,
          email,
          passwordHash,
          nombre,
          activo: true,
        },
      });

      const token = sign(
        {
          userId: user.id,
          tenantId: user.tenantId,
          email: user.email,
          roles: [],
          permisos: [],
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          roles: [],
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    }

    // ============================================
    // LOGIN
    // ============================================
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.usuario.findFirst({
      where: { email },
      include: {
        usuarioRoles: {
          include: { rol: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: "Usuario desactivado" },
        { status: 403 }
      );
    }

    const roles = user.usuarioRoles.map((ur) => ur.rol.nombre);
    const permisos = user.usuarioRoles.flatMap((ur) => (ur.rol.permisos as string[]));

    const token = sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        roles,
        permisos,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        roles,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en auth:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/auth/login (LOGOUT)
// ============================================

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
