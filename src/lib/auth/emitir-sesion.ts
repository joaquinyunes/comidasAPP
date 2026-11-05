// Arma la sesión de un usuario: token de acceso + refresco en cookies HttpOnly.

import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REFRESCO_SEGUNDOS, firmarAcceso } from "./tokens";
import { crearRefresco } from "./sesion-refresh";

const base = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
});

export async function cargarUsuarioConRoles(usuarioId: string) {
  return prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { usuarioRoles: { include: { rol: true } } },
  });
}

type UsuarioConRoles = NonNullable<Awaited<ReturnType<typeof cargarUsuarioConRoles>>>;

export async function emitirSesion(response: NextResponse, user: UsuarioConRoles): Promise<string[]> {
  const roles = user.usuarioRoles.map((ur) => ur.rol.nombre);
  const permisos = user.usuarioRoles.flatMap((ur) => ur.rol.permisos as string[]);
  const acceso = firmarAcceso({ userId: user.id, tenantId: user.tenantId, email: user.email, roles, permisos });
  const refresco = await crearRefresco(user.id);

  // La cookie de acceso dura como el refresco: el JWT vence a los 15 min y el proxy
  // lo renueva; si la cookie desapareciera con el JWT no habría forma de renovar.
  response.cookies.set("token", acceso, { ...base(), maxAge: REFRESCO_SEGUNDOS, path: "/" });
  // El refresco solo viaja a las rutas de auth.
  response.cookies.set("refresh", refresco, { ...base(), maxAge: REFRESCO_SEGUNDOS, path: "/api/auth" });
  return roles;
}

export function borrarCookiesSesion(response: NextResponse): void {
  response.cookies.set("token", "", { ...base(), maxAge: 0, path: "/" });
  response.cookies.set("refresh", "", { ...base(), maxAge: 0, path: "/api/auth" });
}
