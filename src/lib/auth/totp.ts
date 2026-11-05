// ============================================================
// TOTP (RFC 6238, SHA-1, 6 dígitos, 30 s) sin dependencias.
// Compatible con Google Authenticator, Authy, 1Password, etc.
// ============================================================

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PASO_MS = 30_000;

function aBase32(buf: Buffer): string {
  let bits = 0;
  let val = 0;
  let out = "";
  for (const b of buf) {
    val = (val << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}

function deBase32(s: string): Buffer {
  let bits = 0;
  let val = 0;
  const out: number[] = [];
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(c);
    if (i < 0) throw new Error("Secreto TOTP inválido");
    val = (val << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function nuevoSecretoTotp(): string {
  return aBase32(randomBytes(20));
}

export function codigoTotp(secretoB32: string, ahoraMs = Date.now(), digitos = 6): string {
  const contador = Buffer.alloc(8);
  contador.writeBigUInt64BE(BigInt(Math.floor(ahoraMs / PASO_MS)));
  const h = createHmac("sha1", deBase32(secretoB32)).update(contador).digest();
  const o = h[h.length - 1] & 0xf;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digitos).padStart(digitos, "0");
}

// Acepta el paso anterior y el siguiente (relojes desfasados).
export function verificarTotp(secretoB32: string, codigo: string, ahoraMs = Date.now()): boolean {
  if (!/^\d{6}$/.test(codigo)) return false;
  let ok = false;
  for (const d of [-1, 0, 1]) {
    const esperado = Buffer.from(codigoTotp(secretoB32, ahoraMs + d * PASO_MS));
    if (timingSafeEqual(esperado, Buffer.from(codigo))) ok = true; // sin cortocircuito
  }
  return ok;
}

export function uriOtpauth(secretoB32: string, cuenta: string, emisor = "Cozizina"): string {
  const e = encodeURIComponent(emisor);
  return `otpauth://totp/${e}:${encodeURIComponent(cuenta)}?secret=${secretoB32}&issuer=${e}&algorithm=SHA1&digits=6&period=30`;
}
