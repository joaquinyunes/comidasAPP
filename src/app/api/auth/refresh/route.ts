export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";
import { consumirRefresco } from "@/lib/auth/sesion-refresh";
import { emitirSesion, borrarCookiesSesion, cargarUsuarioConRoles } from "@/lib/auth/emitir-sesion";
import { destinoSeguro } from "@/lib/auth/destino-seguro";

// ============================================
// Renovación de sesión con el token de refresco (se rota en cada uso).
// POST: lo usa el navegador cuando una llamada a la API devuelve 401.
// GET ?volver=/dashboard/...: lo usa el proxy cuando una página llega con el
// acceso vencido; renueva y vuelve a la página (solo rutas internas).
// ============================================

async function renovar(request: NextRequest, response: NextResponse): Promise<boolean> {
  const refresco = request.cookies.get("refresh")?.value;
  if (!refresco) return false;
  const usuarioId = await consumirRefresco(refresco);
  if (!usuarioId) return false;
  const user = await cargarUsuarioConRoles(usuarioId);
  if (!user || !user.activo) return false;
  await emitirSesion(response, user);
  return true;
}

export async function POST(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;
  try {
    const response = NextResponse.json({ success: true });
    if (await renovar(request, response)) return response;
  } catch (error) {
    console.error("Error al renovar sesión:", error);
  }
  const fallo = NextResponse.json({ error: "Sesión vencida" }, { status: 401 });
  borrarCookiesSesion(fallo);
  return fallo;
}

export async function GET(request: NextRequest) {
  const destino = destinoSeguro(request.nextUrl.searchParams.get("volver"));
  try {
    const response = NextResponse.redirect(new URL(destino, request.url));
    if (await renovar(request, response)) return response;
  } catch (error) {
    console.error("Error al renovar sesión:", error);
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("callbackUrl", destino);
  const fallo = NextResponse.redirect(login);
  borrarCookiesSesion(fallo);
  return fallo;
}
