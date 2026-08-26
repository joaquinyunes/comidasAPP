import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { authRateLimit } from "@/lib/rate-limit";

// ============================================
// POST /api/auth/password — cambiar la propia contraseña
// ============================================

const Schema = z.object({
  actual: z.string().min(1),
  nueva: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
});

export async function POST(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;

  const ctx = await getTenantContext(request);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: ctx.usuarioId },
    select: { id: true, passwordHash: true },
  });
  if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  if (!(await compare(parsed.data.actual, usuario.passwordHash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 403 });
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash: await hash(parsed.data.nueva, 12) },
  });

  return NextResponse.json({ success: true });
}
