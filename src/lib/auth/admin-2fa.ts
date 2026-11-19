// 2FA obligatorio para el rol administrador (permiso "*"): en producción, o donde se defina
// ADMIN_2FA_OBLIGATORIO=1. Mientras no lo active, su sesión lleva `debe2fa` y el proxy solo lo
// deja entrar a «Mi cuenta» y a /api/auth para activarlo. Si pierde el celular, se reinicia con
// `scripts/nuevo-cliente/index.ts clave --reiniciar-2fa si` (ver docs/SEGURIDAD-REVISION-2.md).

export const admin2faObligatorio = (): boolean =>
  process.env.NODE_ENV === "production" || process.env.ADMIN_2FA_OBLIGATORIO === "1";

export const esAdministrador = (permisos: string[]): boolean => permisos.includes("*");

export const debeActivar2fa = (permisos: string[], totpActivo: boolean): boolean =>
  admin2faObligatorio() && esAdministrador(permisos) && !totpActivo;
