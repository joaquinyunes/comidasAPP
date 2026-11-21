# Lo que le toca al usuario — Cozizina (21/11/2026)

Nada de esto está tildado: ninguna sesión puede hacerlo por vos. El código está listo en la rama `feat/venta-fase2` (en origin). **No se integró a `master`** porque `master` todavía tiene la falla del pago público: se integra cuando termines los pasos 1 a 6.

## En orden (producción)
1. **Restaurar el proyecto de Supabase `comida-app`** (hoy está INACTIVO) y confirmar que conecta.
2. **Backup restaurable** de esa base, **antes** de tocar nada (`docs/BACKUPS.md`).
3. **Baseline de migraciones** (producción se armó con `db push`): `prisma migrate resolve --applied 0001_init_bloque2` y `--applied 0005_alinear_esquema` (`docs/PENDIENTES-VENTA.md`).
4. **Migraciones pendientes:** `prisma migrate deploy` (`0002`, `0003`, `0004`, `0006`, `0007`). Antes, la consulta de pagos duplicados del encabezado de `0002`.
5. **Variables en Vercel (Production):**
   - `MERCADOPAGO_WEBHOOK_SECRET` — obligatoria (sin ella el webhook responde 500).
   - `TENANT_SLUG` — el `slug` del restaurante en la base (sin él, nadie entra).
   - `QR_LOCAL_CODIGO` — **valor nuevo** (el viejo estuvo público); reimprimir el QR del local.
   - `IMAGENES_HOSTS` si hay fotos externas; `BOOTSTRAP_TOKEN` solo si se crea un primer usuario por la API; `JWT_SECRET` fuerte.
6. `node scripts/verificar-despliegue.mjs --env <archivo>` debe decir «Listo para desplegar». Recién ahí: `git push origin feat/venta-fase2:master`.
7. Cada administrador activa el 2FA al entrar (es obligatorio). Revisar que los **roles reales** tengan lo que su gente necesita (solo `Gerente` se completó solo).

## Decisiones y trámites
- **Privacidad y términos** con un abogado (Ley 25.326); hoy no están revisados por un profesional.
- **Contrato y licencia** (V6) y el **contrato del piloto** (borrador en `docs/PILOTO.md`).
- **Migrar o no a MongoDB:** `docs/INFORME-MONGODB.md` recomienda NO migrar; confirmar. Y confirmar **construir vs. integrar con Fudo** (`docs/BACKOFFICE.md`).
- **Proveedor de email** para recuperar claves (hoy deshabilitada en producción: se usa `scripts/nuevo-cliente clave`).
- **Testimonios** de la landing (son de ejemplo inventado), **contacto real** y **URL del demo** en `ventas/index.html`; contacto de `security.txt`.

## Cuentas y pruebas reales
- **Mercado Pago modo prueba:** pago aprobado, aviso repetido, monto menor, reembolso.
- **Secretos de GitHub** `BACKUP_DATABASE_URL` / `BACKUP_PASSPHRASE` y correr el workflow de backup (GitHub Actions está bloqueado por facturación).
- **CSP:** dejar 7 días en «solo reporte», mirar los reportes y pasar a bloquear (`docs/CSP-A-BLOQUEO.md`).
- **Demo** (V3): crear `cozizina-demo` en Supabase y un proyecto de Vercel aparte (`docs/DEMO.md`).
- **Restaurante piloto** (V10): conseguirlo (`docs/PILOTO.md`).
- Corrida real del despliegue repetible con cuentas de prueba (hoy solo probado en local).
