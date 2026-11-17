import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { nuevoTokenReset, RESET_VALIDEZ_MS } from "@/lib/auth/token-reset";
import { logger } from "@/lib/logger";

// ============================================
// POST /api/auth/reset — solicitar recuperación de contraseña
//
// Todavía NO hay servicio de email. El enlace equivale a la clave de la cuenta, así que en
// producción no se escribe en ningún log ni se genera un token que nadie puede recibir: la
// recuperación en producción queda deshabilitada hasta enganchar un envío real (docs/SEGURIDAD.md).
// En desarrollo el enlace sale por el log para poder probar el flujo.
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

  if (process.env.NODE_ENV === "production") {
    logger.warn("[reset] se pidió recuperar una clave pero no hay canal de envío (email) configurado: no se generó ningún enlace");
    return NextResponse.json(RESPUESTA_OK);
  }

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
