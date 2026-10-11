export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth-context";
import { tienePermiso } from "@/lib/panel/permisos";

// ============================================
// GET  /api/configuracion/accesos — quién puede entrar y con qué rol
// POST /api/configuracion/accesos — dar de alta a una persona (solo admin)
// ============================================

const Alta = z.object({
  nombre: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
  rolId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const [usuarios, roles] = await Promise.all([
      prisma.usuario.findMany({
        where: { tenantId: ctx.tenantId, deletedAt: null },
        select: {
          id: true,
          nombre: true,
          email: true,
          activo: true,
          usuarioRoles: { select: { rol: { select: { nombre: true } } } },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.rol.findMany({
        where: { tenantId: ctx.tenantId },
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
      }),
    ]);

    return NextResponse.json({
      data: {
        usuarios: usuarios.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          activo: u.activo,
          roles: u.usuarioRoles.map((ur) => ur.rol.nombre),
        })),
        roles,
        yo: ctx.usuarioId,
      },
    });
  } catch (error) {
    console.error("Error GET /api/configuracion/accesos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getTenantContext(request);
    if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!tienePermiso(ctx.permisos, "*")) {
      return NextResponse.json({ error: "Solo un administrador puede dar de alta usuarios." }, { status: 403 });
    }

    const parsed = Alta.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos", detalles: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const { nombre, email, password, rolId } = parsed.data;

    const rol = await prisma.rol.findFirst({ where: { id: rolId, tenantId: ctx.tenantId }, select: { id: true } });
    if (!rol) return NextResponse.json({ error: "Ese rol no existe." }, { status: 404 });

    const existe = await prisma.usuario.findFirst({
      where: { tenantId: ctx.tenantId, email },
      select: { id: true },
    });
    if (existe) return NextResponse.json({ error: "Ya hay un usuario con ese email." }, { status: 409 });

    const sucursal = await prisma.sucursal.findFirst({
      where: { tenantId: ctx.tenantId, ...(ctx.sucursalId ? { id: ctx.sucursalId } : {}) },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const usuario = await prisma.usuario.create({
      data: {
        tenantId: ctx.tenantId,
        nombre,
        email,
        passwordHash: await hash(password, 12),
        activo: true,
        usuarioRoles: { create: { rolId: rol.id, sucursalId: sucursal?.id ?? null } },
      },
      select: { id: true, nombre: true, email: true },
    });

    await prisma.auditLog
      .create({
        data: {
          tenantId: ctx.tenantId,
          usuarioId: ctx.usuarioId,
          accion: "CREAR",
          entidad: "Usuario",
          entidadId: usuario.id,
          valorNuevo: { email: usuario.email, rolId: rol.id },
        },
      })
      .catch((e) => console.error("[POST accesos] auditoría falló:", e));

    return NextResponse.json({ data: usuario }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/configuracion/accesos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
