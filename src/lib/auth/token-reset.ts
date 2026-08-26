import { createHash, randomBytes } from "crypto";

// Token de recuperación de contraseña: se envía el valor plano al
// usuario, se guarda solo el hash.

export function nuevoTokenReset(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashTokenReset(token) };
}

export function hashTokenReset(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const RESET_VALIDEZ_MS = 60 * 60 * 1000; // 1 hora
