import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper: ejecutar query con tenant_id
export async function withTenant<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  return fn();
}

// Helper: obtener tenant por slug
export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
  });
}

// Helper: obtener sucursal por defecto de un tenant
export async function getDefaultSucursal(tenantId: string) {
  return prisma.sucursal.findFirst({
    where: { tenantId, activa: true },
    orderBy: { createdAt: "asc" },
  });
}

// Helper: verificar permisos de usuario
export async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      usuarioRoles: { include: { rol: true } },
    },
  });

  if (!user) return false;

  const permisos = user.usuarioRoles.flatMap((ur) => ur.rol.permisos as string[]);

  if (permisos.includes("*")) return true;
  if (permisos.includes(permission)) return true;

  const [recurso] = permission.split(":");
  if (permisos.includes(`${recurso}:*`)) return true;

  return false;
}
