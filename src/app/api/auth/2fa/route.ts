export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { authRateLimit } from "@/lib/rate-limit";
import { nuevoSecretoTotp, uriOtpauth, verificarTotp } from "@/lib/auth/totp";

// ============================================
// 2FA (TOTP) del propio usuario del panel
// GET    → ¿está activo?
// POST   → empieza el alta: devuelve secreto y URI para la app (aún no exige código)
// PUT    → confirma con un código de la app y lo activa
// DELETE → lo desactiva (pide contraseña y un código vigente)
// shortcut: el secreto se guarda en claro en la fila del usuario; quien lee la base ya
// puede todo lo demás. Cifrarlo con una clave aparte cuando haya más de un operador de BD.
// ============================================

const Codigo = z.object({ codigo: z.string().regex(/^\d{6}$/, "El código tiene 6 números") });
const Baja = Codigo.extend({ password: z.string().min(1).max(200) });

async function usuarioActual(request: NextRequest) {
  const ctx = await getTenantContext(request);
  if (!ctx) return null;
  return prisma.usuario.findUnique({
    where: { id: ctx.usuarioId },
    select: { id: true, tenantId: true, email: true, passwordHash: true, totpActivo: true, totpSecreto: true },
  });
}

const auditar = (u: { tenantId: string; id: string }, accion: string) =>
  prisma.auditLog
    .create({ data: { tenantId: u.tenantId, usuarioId: u.id, accion, entidad: "Usuario", entidadId: u.id } })
    .catch((e) => console.error("[2fa] auditoría falló:", e));

export async function GET(request: NextRequest) {
  const u = await usuarioActual(request);
  if (!u) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  return NextResponse.json({ data: { activo: u.totpActivo } });
}

export async function POST(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;
  const u = await usuarioActual(request);
  if (!u) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (u.totpActivo) return NextResponse.json({ error: "El 2FA ya está activo." }, { status: 409 });

  const secreto = nuevoSecretoTotp();
  await prisma.usuario.update({ where: { id: u.id }, data: { totpSecreto: secreto } });
  return NextResponse.json({ data: { secreto, uri: uriOtpauth(secreto, u.email) } });
}

export async function PUT(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;
  const u = await usuarioActual(request);
  if (!u) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = Codigo.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", details: parsed.error.issues }, { status: 400 });
  if (!u.totpSecreto) return NextResponse.json({ error: "Primero pedí el secreto (POST)." }, { status: 409 });
  if (!verificarTotp(u.totpSecreto, parsed.data.codigo)) {
    return NextResponse.json({ error: "El código no es correcto." }, { status: 400 });
  }

  await prisma.usuario.update({ where: { id: u.id }, data: { totpActivo: true } });
  await auditar(u, "ACTIVAR_2FA");
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const limitada = await authRateLimit(request);
  if (limitada) return limitada;
  const u = await usuarioActual(request);
  if (!u) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = Baja.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", details: parsed.error.issues }, { status: 400 });
  if (!u.totpActivo || !u.totpSecreto) return NextResponse.json({ error: "El 2FA no está activo." }, { status: 409 });
  if (!(await compare(parsed.data.password, u.passwordHash)) || !verificarTotp(u.totpSecreto, parsed.data.codigo)) {
    return NextResponse.json({ error: "Contraseña o código incorrectos." }, { status: 403 });
  }

  await prisma.usuario.update({ where: { id: u.id }, data: { totpActivo: false, totpSecreto: null } });
  await auditar(u, "DESACTIVAR_2FA");
  return NextResponse.json({ success: true });
}
