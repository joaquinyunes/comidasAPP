import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { hashTokenReset } from "@/lib/auth/token-reset";

// ============================================
// POST /api/auth/reset/confirmar — fijar nueva contraseña con token
// ============================================

const Schema = z.object({
  token: z.string().min(10),
  nueva: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const reset = await prisma.passwordReset.findFirst({
    where: {
      tokenHash: hashTokenReset(parsed.data.token),
      usado: false,
      expiraEn: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!reset) {
    return NextResponse.json({ error: "El enlace no es válido o ya venció." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: reset.usuarioId },
      data: { passwordHash: await hash(parsed.data.nueva, 12) },
    }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usado: true } }),
    // invalida cualquier otro reset pendiente del mismo usuario
    prisma.passwordReset.updateMany({
      where: { usuarioId: reset.usuarioId, usado: false },
      data: { usado: true },
    }),
  ]);

  return NextResponse.json({ success: true });
}
