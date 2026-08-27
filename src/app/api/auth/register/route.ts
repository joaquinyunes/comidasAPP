import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";

// ============================================
// POST /api/auth/register — alta de personal
//
// Solo un admin puede crear usuarios. Excepción: si el tenant
// todavía no tiene ningún usuario, se permite crear el primero
// (bootstrap de la instalación).
// ============================================

const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  nombre: z.string().min(1, "Nombre requerido").max(100),
  tenantId: z.string().uuid("Tenant inválido"),
  rolId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }
    const { email, password, nombre, tenantId, rolId } = parsed.data;

    const usuariosDelTenant = await prisma.usuario.count({ where: { tenantId } });
    if (usuariosDelTenant > 0) {
      const ctx = await getTenantContext(request);
      const esAdmin = ctx?.tenantId === tenantId && ctx.permisos.includes("*");
      if (!esAdmin) {
        return NextResponse.json(
          { error: "Solo un administrador puede dar de alta usuarios." },
          { status: 403 }
        );
      }
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });

    const existe = await prisma.usuario.findFirst({ where: { email, tenantId }, select: { id: true } });
    if (existe) return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });

    const usuario = await prisma.usuario.create({
      data: {
        tenantId,
        email,
        nombre,
        passwordHash: await hash(password, 12),
        activo: true,
        ...(rolId ? { usuarioRoles: { create: { rolId } } } : {}),
      },
      select: { id: true, email: true, nombre: true },
    });

    return NextResponse.json({ success: true, user: usuario }, { status: 201 });
  } catch (error) {
    console.error("Error en register:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
