# Lo que falta para poder vender (05/11/2026)

Resume lo que **no** está hecho de la sección B y de Z5, con exactamente qué falta y quién lo hace. Lo marcado 👤 lo hace el dueño; ninguna sesión puede hacerlo por él.

## V3 — Entorno de demo separado (👤 + sesión después)
Hoy **no existe**. Qué falta, en orden:
1. 👤 Crear un proyecto de Supabase **aparte** (llamarlo `cozizina-demo`) y un proyecto de Vercel aparte con su propio `DATABASE_URL`. **Nunca** `comida-app`.
2. Sesión: correr `prisma migrate deploy` y `npm run db:seed` contra esa base (el seed ya carga carta, mesas, clientes y pedidos de ejemplo) y poner en la portada un cartel fijo «DEMO — datos de ejemplo».
3. Verificar que la demo no comparte variables con producción y que sus credenciales de Mercado Pago son de **modo prueba**.
4. Poner la URL de la demo en `ventas/index.html` (sección Demo).

## V10 — Restaurante piloto (👤)
Es una persona real que acepte probarlo, con seña o uso real. Hasta que exista: no se sigue construyendo para otro rubro (veredicto del tribunal). Qué se necesita de él: 3 días de pedidos reales, acceso a su cuenta de Mercado Pago (modo prueba primero) y permiso para publicar el resultado.

## Bloqueantes antes de ofrecer el paquete Completo
| Qué | Estado | Quién |
|---|---|---|
| Migraciones `0002`–`0004` aplicadas a la base de producción (`comida-app`) | **Sin aplicar.** El código nuevo falla sin ellas | 👤, después de un backup |
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

### S2 — CSP pasando de «solo reporte» a «bloquear»
Hecho: cabecera `Content-Security-Policy-Report-Only` con `report-uri /api/csp`; la ruta recibe y registra directiva, recurso y página (sin IP ni cookies).
Falta:
1. 👤 Desplegar esta rama a un entorno con tráfico real (o la demo) y dejarla **7 días** corriendo.
2. Leer los logs de Vercel buscando `[csp]` y listar las violaciones reales (directiva + recurso). Agrupar por origen.
3. Decidir por cada violación: permitir ese origen explícito (por ejemplo, un CDN de fuentes o mapa) o corregir el código.
4. Reemplazar `'unsafe-inline'` en `script-src` por **nonces**: Next 16 los soporta, pero obliga a render dinámico en todas las páginas (se pierde el prerenderizado estático de la portada). Probar el costo en rendimiento (`docs/RENDIMIENTO.md`) antes de adoptarlo. Alternativa: dejar `'unsafe-inline'` solo para scripts y bloquear el resto (`object-src`, `base-uri`, `frame-ancestors` ya bloquean).
5. Cambiar `Content-Security-Policy-Report-Only` por `Content-Security-Policy` en `next.config.ts`, recorrer el sitio (portada, `/ordenar`, `/pedir-local`, panel) con la consola abierta, y revertir si algo se rompe.
Criterio de cierre: 7 días sin violaciones nuevas y el recorrido completo sin errores de CSP en la consola.

### S10 — Backups automáticos con prueba de restauración
Hecho: `.github/workflows/backup-db.yml` (volcado, cifrado, restauración en una base vacía y conteo de filas) y `docs/BACKUPS.md`. **Nunca corrió.**
Falta:
1. 👤 En Supabase, crear un usuario de base de **solo lectura** y copiar la cadena del *pooler de sesión*.
2. 👤 En GitHub → Settings → Secrets → Actions: `BACKUP_DATABASE_URL` y `BACKUP_PASSPHRASE` (guardar la frase también en un gestor de contraseñas).
3. 👤 Ejecutar a mano *Actions → Backup de la base → Run workflow*.
4. Sesión o 👤: si falla (versión de `pg_dump`, IPv6, permisos), arreglar el workflow y repetir hasta que el job `restaurar-prueba` quede verde.
5. Anotar fecha y resultado en la tabla de `docs/BACKUPS.md`.
Criterio de cierre: una corrida completa en verde con las filas contadas coherentes con la base real. Sin esto, el paquete Completo no se vende.
