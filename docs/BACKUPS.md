# Backups y prueba de restauración (S10)

**Estado (05/11/2026): armado, NO verificado.** El workflow `.github/workflows/backup-db.yml` existe pero todavía no corrió: necesita dos secretos que carga el dueño. Hasta que corra una vez y la prueba de restauración salga verde, **no se puede vender** (ver `PLAN-VENTA-10K.md`, S10).

## Qué hace
Cada domingo (y a pedido en *Actions → Backup de la base → Run workflow*):
1. `pg_dump` de la base de producción (formato custom) → cifrado con GPG (AES-256) → artefacto de GitHub por 30 días.
2. Un segundo job lo **descifra y lo restaura en un Postgres vacío** y cuenta filas de `tenants`, `usuarios`, `productos`, `pedidos`, `pagos`. Falla si no hay ni un tenant.

## Qué tenés que hacer vos (👤)
1. En Supabase (`comida-app`) creá un usuario de base **solo lectura** y copiá su cadena de conexión del *pooler de sesión* (GitHub Actions no usa IPv6).
2. En GitHub → Settings → Secrets → Actions, cargá:
   - `BACKUP_DATABASE_URL` = esa cadena.
   - `BACKUP_PASSPHRASE` = una frase larga; guardala también en tu gestor de contraseñas (sin ella el backup no se abre).
3. Corré el workflow a mano y anotá abajo la fecha y el resultado.

## Prueba local de respaldo y restauración (17/11/2026)
`npx tsx scripts/prueba-local/backup-restaurar.mts` (necesita `EMBEDDED_PG_DIR`, ver el encabezado de `scripts/prueba-local/ayudas.mts`). Hace una copia **física en frío** de una base Postgres 18 real con datos (25 pedidos, 25 pagos), la cifra con `gpg` AES-256, **borra la original**, la descifra y la levanta en otro puerto.

| Paso | Segundos |
|---|---|
| Base con datos (migrar + alta + 25 pedidos y pagos) | 10 |
| Apagado limpio | 0,1 |
| Empaquetar (.tgz, 6.397 KB) | 1,3 |
| Cifrar con gpg | 0,5 |
| Probar que la frase equivocada no abre | 0,2 |
| Descifrar y desempaquetar | 1,4 |
| Levantar la copia y contar | 2,2 |
| **Total** | **≈ 16–25 (según la corrida)** |

Resultado: **12 de 12 comprobaciones en verde.** Tras restaurar coinciden las filas de `tenants`, `usuarios`, `roles`, `pedidos`, `pagos`, `audit_log` y `pedido_eventos`, la suma de pagos (25.325,00) y el hash de las claves; el archivo cifrado no contiene texto legible de la base; la frase equivocada es rechazada.

**Lo que esta prueba NO cubre:** `pg_dump`/`pg_restore` (no están en la máquina de desarrollo; son los que usa el workflow de GitHub y **siguen sin haber corrido**), ni una base de Supabase, ni una copia en caliente. Prueba que la idea de «copia cifrada que se abre y devuelve lo mismo» funciona; el workflow real hay que correrlo una vez (pasos de arriba).

## Registro de pruebas de restauración
| Fecha | Quién | Resultado |
|---|---|---|
| 17/11/2026 | sesión (local, Postgres 18 embebido, copia física + gpg) | OK: 12/12 comprobaciones; no usa pg_dump |
| _(pendiente)_ | dueño (workflow de GitHub con pg_dump y la base real) | |

## Restaurar a mano (emergencia)
```bash
gpg --decrypt --output cozizina.dump cozizina.dump.gpg
pg_restore --no-owner --no-privileges --dbname "<URL de la base nueva>" cozizina.dump
```
Después aplicar las migraciones pendientes: `npx prisma migrate deploy`.

## Límites conocidos
- Los artefactos de GitHub duran 30 días y viven en la cuenta del repositorio; para retención larga copiar el `.gpg` a otro almacenamiento (por ejemplo un bucket del cliente).
- Supabase también hace sus propios backups según el plan contratado; este es el respaldo independiente.
- No cubre archivos subidos (las fotos de la carta son URLs externas).
