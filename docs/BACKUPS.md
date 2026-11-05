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

## Registro de pruebas de restauración
| Fecha | Quién | Resultado |
|---|---|---|
| _(pendiente)_ | | |

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
