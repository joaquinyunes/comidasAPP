import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { nuevoTokenReset, RESET_VALIDEZ_MS } from "@/lib/auth/token-reset";
import { logger } from "@/lib/logger";

// ============================================
// POST /api/auth/reset — solicitar recuperación de contraseña
//
// Sin servicio de email: el link se registra en el log del
// servidor. En producción, enganchar un envío real acá.
// ============================================

const Schema = z.object({ email: z.string().email() });

const RESPUESTA_OK = {
  success: true,
  mensaje: "Si el email existe, te enviamos un enlace para recuperar la contraseña.",
};

export async function POST(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findFirst({
    where: { email: parsed.data.email, activo: true },
    select: { id: true },
  });

  // No revelamos si el email existe.
  if (!usuario) return NextResponse.json(RESPUESTA_OK);

  const { token, hash } = nuevoTokenReset();
  await prisma.passwordReset.create({
    data: {
      usuarioId: usuario.id,
      tokenHash: hash,
      expiraEn: new Date(Date.now() + RESET_VALIDEZ_MS),
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  logger.info(
    `[reset] enlace para ${parsed.data.email}: ${base.replace(/\/$/, "")}/recuperar?token=${token}`
  );

  return NextResponse.json(RESPUESTA_OK);
}
