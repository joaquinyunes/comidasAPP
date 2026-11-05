import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { estaBloqueado, registrarFallo, limpiarFallos } from "@/lib/auth/bloqueo-login";
import { verificarTotp } from "@/lib/auth/totp";
import { emitirSesion, borrarCookiesSesion } from "@/lib/auth/emitir-sesion";
import { revocarRefresco, revocarTodas } from "@/lib/auth/sesion-refresh";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/auth/login — iniciar sesión (con código 2FA si el usuario lo activó)
// DELETE /api/auth/login — cerrar sesión (?todas=1: en todos los dispositivos)
// Refresco de sesión: /api/auth/refresh. Alta de usuarios: /api/auth/register.
// ============================================

const LoginSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Contraseña demasiado corta").max(200),
  codigo: z.string().regex(/^\d{6}$/, "El código tiene 6 números").optional(),
});

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

    const { email, password, codigo } = parsed.data;
    const clave = email.toLowerCase();

    const espera = estaBloqueado(clave);
    if (espera > 0) {
      return NextResponse.json(
        { error: "Demasiados intentos. Probá de nuevo en unos minutos.", retryAfter: espera },
        { status: 429, headers: { "Retry-After": String(espera) } }
      );
    }

    const user = await prisma.usuario.findFirst({
      where: { email },
      include: { usuarioRoles: { include: { rol: true } } },
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      registrarFallo(clave);
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    if (!user.activo) {
      return NextResponse.json({ error: "Usuario desactivado" }, { status: 403 });
    }

    if (user.totpActivo && user.totpSecreto) {
      if (!codigo) {
        // Contraseña correcta, falta el segundo factor: el formulario pide el código.
        return NextResponse.json(
          { error: "Ingresá el código de tu app de verificación.", requiere2fa: true },
          { status: 401 }
        );
      }
      if (!verificarTotp(user.totpSecreto, codigo)) {
        registrarFallo(clave);
        return NextResponse.json({ error: "El código no es correcto.", requiere2fa: true }, { status: 401 });
      }
    }

    limpiarFallos(clave);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, nombre: user.nombre },
    });
    await emitirSesion(response, user);
    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const refresco = request.cookies.get("refresh")?.value;
    if (request.nextUrl.searchParams.get("todas") === "1") {
      const ctx = await getTenantContext(request);
      if (ctx) await revocarTodas(ctx.usuarioId);
    } else if (refresco) {
      await revocarRefresco(refresco);
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
  const response = NextResponse.json({ success: true });
  borrarCookiesSesion(response);
  return response;
}
