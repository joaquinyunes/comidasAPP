export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// GET /api/auth/me — usuario de la sesión actual
// ============================================

export async function GET(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const usuario = await prisma.usuario.findUnique({
    where: { id: ctx.usuarioId },
    select: { id: true, email: true, nombre: true },
  });
  if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  return NextResponse.json({
    data: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      roles: ctx.roles,
      permisos: ctx.permisos,
    },
  });
}
