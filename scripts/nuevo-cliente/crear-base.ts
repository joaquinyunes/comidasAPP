// Alta mínima de un restaurante en una base NUEVA: tenant, sucursal, roles y un administrador.
// Sin carta, mesas, clientes ni pedidos de ejemplo (nada de datos inventados en un cliente real).

import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { ROLES_BASE } from "../../prisma/roles-base";

export interface AltaCliente {
  nombre: string;
  slug: string;
  sucursal: string;
  adminEmail: string;
  adminNombre: string;
  claveAdmin: string;
}

export async function crearBaseCliente(prisma: PrismaClient, a: AltaCliente) {
  if (await prisma.tenant.findUnique({ where: { slug: a.slug }, select: { id: true } })) {
    throw new Error(`Ya existe un restaurante con el slug "${a.slug}". No se tocó nada.`);
  }

  const passwordHash = await hash(a.claveAdmin, 12);
  const tenantId = randomUUID();
  const sucursalId = randomUUID();
  const usuarioId = randomUUID();
  const rolIds = new Map(ROLES_BASE.map((r) => [r.id, randomUUID()]));

  await prisma.$transaction(async (tx) => {
    await tx.tenant.create({ data: { id: tenantId, nombre: a.nombre, slug: a.slug, plan: "premium", activo: true } });
    await tx.sucursal.create({ data: { id: sucursalId, tenantId, nombre: a.sucursal, activa: true } });
    for (const rol of ROLES_BASE) {
      await tx.rol.create({
        data: { id: rolIds.get(rol.id)!, tenantId, nombre: rol.nombre, permisos: [...rol.permisos] },
      });
    }
    await tx.usuario.create({
      data: { id: usuarioId, tenantId, email: a.adminEmail, nombre: a.adminNombre, passwordHash, activo: true },
    });
    await tx.usuarioRol.create({
      data: { usuarioId, rolId: rolIds.get("rol-admin")!, sucursalId },
    });
  });

  return { tenantId, sucursalId, usuarioId };
}
