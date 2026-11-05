// ============================================================
// Token de refresco opaco, guardado como hash en `sesiones`.
// Se rota en cada uso: el viejo deja de servir, así un token
// robado solo vale hasta que el dueño real renueve.
// ============================================================

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { REFRESCO_SEGUNDOS } from "./tokens";

const hashDe = (token: string) => createHash("sha256").update(token).digest("hex");

export async function crearRefresco(usuarioId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.sesion.create({
    data: {
      usuarioId,
      tokenHash: hashDe(token),
      expiraEn: new Date(Date.now() + REFRESCO_SEGUNDOS * 1000),
    },
  });
  return token;
}

// Devuelve el usuarioId si el token existe y no venció; lo consume (un solo uso).
export async function consumirRefresco(token: string): Promise<string | null> {
  const tokenHash = hashDe(token);
  const sesion = await prisma.sesion.findFirst({
    where: { tokenHash, expiraEn: { gt: new Date() } },
    select: { id: true, usuarioId: true },
  });
  if (!sesion) return null;
  // deleteMany: si dos pedidos de refresco llegan juntos, solo uno borra la fila y gana.
  const { count } = await prisma.sesion.deleteMany({ where: { id: sesion.id } });
  return count === 1 ? sesion.usuarioId : null;
}

export async function revocarRefresco(token: string): Promise<void> {
  await prisma.sesion.deleteMany({ where: { tokenHash: hashDe(token) } });
}

export async function revocarTodas(usuarioId: string): Promise<void> {
  await prisma.sesion.deleteMany({ where: { usuarioId } });
}
