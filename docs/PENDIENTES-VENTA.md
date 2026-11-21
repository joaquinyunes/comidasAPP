# Lo que falta para poder vender (05/11/2026)

Resume lo que **no** está hecho de la sección B y de Z5, con exactamente qué falta y quién lo hace. Lo marcado 👤 lo hace el dueño; ninguna sesión puede hacerlo por él.

## V3 — Entorno de demo separado
**Hecho y probado en local (21/11/2026):** `DEMO_MODE=1` con cartel fijo, seed protegido por nombre de base, `verificar-despliegue.mjs` que impide usar el demo con la base real y guía en `docs/DEMO.md` (`scripts/prueba-local/demo.mts`: 7 verificaciones en verde). **Falta 👤:** crear el proyecto de Supabase `cozizina-demo` y el de Vercel aparte, y poner la URL en `ventas/index.html` (pasos en `docs/DEMO.md`).

## V10 — Restaurante piloto (👤)
Kit listo en `docs/PILOTO.md` (checklist, métricas y contrato borrador). Es una persona real que acepte probarlo, con seña o uso real. Hasta que exista: no se sigue construyendo para otro rubro (veredicto del tribunal). Qué se necesita de él: 3 días de pedidos reales, acceso a su cuenta de Mercado Pago (modo prueba primero) y permiso para publicar el resultado.

## Bloqueantes antes de ofrecer el paquete Completo
| Qué | Estado | Quién |
|---|---|---|
| Migraciones `0002`–`0004`, `0006` y `0007` aplicadas a la base de producción (`comida-app`); y **antes**, declarar `0001` y `0005` como aplicadas (ver abajo) | **Sin aplicar.** El código nuevo falla sin ellas | 👤, después de un backup |
| Backup restaurado al menos una vez | Workflow listo, **sin correr** | 👤 (secretos) → ver S10 abajo |
| Mercado Pago real probado (pago aprobado, aviso repetido) | Sin credenciales | 👤 |
| WhatsApp (aviso de pedido) | **No construido**; falta cuenta de WhatsApp Business | 👤 + sesión |
| Factura electrónica con proveedor certificado | **No construida**; falta elegir proveedor y contador | 👤 + sesión |
| Contrato y licencia (V6) | Sin hacer | 👤 con abogado |
| Texto de privacidad y términos (Ley 25.326) | Sin revisar por un profesional | 👤 |
| Testimonios de la landing | Son de ejemplo inventado | 👤 reemplazar o quitar |
| Contacto real y demo en `ventas/index.html` | Placeholder `COMPLETAR@dominio.example` | 👤 |
| Primera corrida real del despliegue repetible (V4) | **No probado de cero** | sesión con cuentas de prueba de 👤 |

## Z5 — Qué falta exactamente de S2 y S10

## Cómo aplicar las migraciones a producción (`comida-app`) — leer ANTES de correr nada
`comida-app` se armó con `db push`: no tiene la tabla `_prisma_migrations`. Correr `prisma migrate deploy` a secas intentaría crear tablas que ya existen y fallaría. Orden seguro (todo con `DATABASE_URL` de producción, después de un backup restaurable):
1. **Mirar sin cambiar nada:** `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`. Tiene que mostrar **solo** lo de las migraciones 0002 y 0004: columna `pagos.referencia` con su índice único y columnas `usuarios.totp_secreto` y `usuarios.totp_activo`. Si muestra algo más (por ejemplo columnas de `0005`), producción no está tan alineada como se supone: **parar** y revisar.
2. **Declarar como ya aplicadas** las que producción ya tiene por `db push`: `npx prisma migrate resolve --applied 0001_init_bloque2` y `npx prisma migrate resolve --applied 0005_alinear_esquema`.
3. **Aplicar las pendientes:** `npx prisma migrate deploy` (corre `0002`, `0003`, `0004`, `0006` y `0007`). Después: `node scripts/verificar-despliegue.mjs --env <archivo>`.
4. Antes del paso 3, la consulta de duplicados que está en el encabezado de `0002`: si hay pagos repetidos por pedido y referencia, el índice único fallaría.
Probado solo en una base **nueva** (`scripts/prueba-local/despliegue-de-cero.mts`); el procedimiento para una base existente **no se ensayó**: probarlo primero en una copia restaurada del backup.


### S2 — CSP pasando de «solo reporte» a «bloquear»
**Actualización 17/11/2026:** el interruptor (`CSP_MODO=bloquear`, variable de build), los tests y el checklist completo están en `docs/CSP-A-BLOQUEO.md`. Lo único que falta es lo que depende de tráfico real (pasos 1–7 de ese checklist, 👤).

Hecho: cabecera `Content-Security-Policy-Report-Only` con `report-uri /api/csp`; la ruta recibe y registra directiva, recurso y página (sin IP ni cookies).
Falta:
1. 👤 Desplegar esta rama a un entorno con tráfico real (o la demo) y dejarla **7 días** corriendo.
2. Leer los logs de Vercel buscando `[csp]` y listar las violaciones reales (directiva + recurso). Agrupar por origen.
3. Decidir por cada violación: permitir ese origen explícito (por ejemplo, un CDN de fuentes o mapa) o corregir el código.
4. Reemplazar `'unsafe-inline'` en `script-src` por **nonces**: Next 16 los soporta, pero obliga a render dinámico en todas las páginas (se pierde el prerenderizado estático de la portada). Probar el costo en rendimiento (`docs/RENDIMIENTO.md`) antes de adoptarlo. Alternativa: dejar `'unsafe-inline'` solo para scripts y bloquear el resto (`object-src`, `base-uri`, `frame-ancestors` ya bloquean).
5. Cambiar `Content-Security-Policy-Report-Only` por `Content-Security-Policy` en `next.config.ts`, recorrer el sitio (portada, `/ordenar`, `/pedir-local`, panel) con la consola abierta, y revertir si algo se rompe.
Criterio de cierre: 7 días sin violaciones nuevas y el recorrido completo sin errores de CSP en la consola.

### S10 — Backups automáticos con prueba de restauración
**Actualización 17/11/2026:** la restauración se probó **en local** con una base Postgres real (copia cifrada que se abre y devuelve los mismos datos, 12/12; resultados en `docs/BACKUPS.md`). Lo que sigue sin probar es el workflow de GitHub con `pg_dump` y la base real.

Hecho: `.github/workflows/backup-db.yml` (volcado, cifrado, restauración en una base vacía y conteo de filas) y `docs/BACKUPS.md`. **Nunca corrió.**
Falta:
1. 👤 En Supabase, crear un usuario de base de **solo lectura** y copiar la cadena del *pooler de sesión*.
2. 👤 En GitHub → Settings → Secrets → Actions: `BACKUP_DATABASE_URL` y `BACKUP_PASSPHRASE` (guardar la frase también en un gestor de contraseñas).
3. 👤 Ejecutar a mano *Actions → Backup de la base → Run workflow*.
4. Sesión o 👤: si falla (versión de `pg_dump`, IPv6, permisos), arreglar el workflow y repetir hasta que el job `restaurar-prueba` quede verde.
5. Anotar fecha y resultado en la tabla de `docs/BACKUPS.md`.
Criterio de cierre: una corrida completa en verde con las filas contadas coherentes con la base real. Sin esto, el paquete Completo no se vende.
