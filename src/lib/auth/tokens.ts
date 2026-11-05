// Constantes y firma del token de acceso (JWT corto). La renovación usa el
// token de refresco opaco de sesion-refresh.ts.

import { sign } from "jsonwebtoken";
import { getJwtSecret } from "@/lib/jwt-secret";

export const ACCESO_SEGUNDOS = 15 * 60;
export const REFRESCO_SEGUNDOS = 7 * 24 * 60 * 60;

export interface DatosSesion {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  permisos: string[];
}

export function firmarAcceso(datos: DatosSesion): string {
  return sign(datos, getJwtSecret(), { expiresIn: ACCESO_SEGUNDOS });
}
