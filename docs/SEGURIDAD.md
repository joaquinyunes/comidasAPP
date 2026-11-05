# Seguridad de Cozizina — estado y hallazgos (S1–S13)

Revisión del 05/11/2026 sobre la rama `feat/venta-10k`. Leyenda: ✅ hecho y verificado · 🟡 hecho en parte · ☐ no hecho (motivo) · 👤 lo hace el dueño.

| # | Qué | Estado | Detalle |
|---|---|---|---|
| S1 | `npm audit --omit=dev` | ✅ | 0 críticas, 0 altas (`next` 16.4.5, `zod` 4.6.7, `sharp`, `undici`, `body-parser`, `proxy-addr`…). Quedan 4 moderadas + 2 bajas, todas de la herramienta `shadcn` (solo se usa su CSS): el único arreglo es `--force` a `shadcn@1.0.0` (cambio mayor); no se aplicó. El CI ahora **falla** con altas. |
| S2 | CSP bloqueando | ☐ | Sigue en «solo reporte». Se agregó `/api/csp` (recibe y registra las violaciones) y `report-uri`. Falta juntar reportes con tráfico real y pasar a nonces (hoy Next inyecta scripts en línea, hace falta `'unsafe-inline'`). Pasar a bloquear sin mirar reportes rompería el sitio. |
| S3 | Rate limit y bloqueo | ✅ | Login: 10/min por IP + bloqueo de 15 min a la cuenta tras 5 fallos. Pedidos de clientes, cupón, pago y pago MP: por IP. Webhook MP y reportes CSP: por IP. Límite en memoria del proceso (ver `shortcut:` en `bloqueo-login.ts`). |
| S4 | Admin y sesión | 🟡 | ✅ bcrypt, mínimo **12** caracteres (alta, cambio, reinicio, accesos), cookies `HttpOnly; Secure; SameSite=Lax`, acceso JWT de **15 min** + refresco rotativo de 7 días (un solo uso, hash en BD), «cerrar sesión en todos los dispositivos», cambiar la clave cierra las demás sesiones. ✅ 2FA TOTP opcional (Mi cuenta). 🟡 el 2FA no es obligatorio: cada admin debe activarlo; la migración `0004` está sin aplicar (👤). |
| S5 | Validación en el borde | ✅ | zod en todas las rutas que escriben datos (se cerraron 7 que no lo hacían). Límites de tamaño en textos y montos. No hay MongoDB, por lo que no aplica el punto de operadores `$`. Los archivos subidos no existen (las fotos son URLs). |
| S6 | Webhooks | ✅ | Firma `x-signature` verificada (`MERCADOPAGO_WEBHOOK_SECRET`), id numérico, índice único pedido+referencia (idempotencia), test con eventos simultáneos y repetidos, y con firma inválida. 👤 cargar el secreto en Vercel; sin él se acepta y se avisa en el log. |
| S7 | Roles y auditoría | 🟡 | ✅ ya se auditaban precio de carta, anulaciones y cambios de estado/cancelaciones; ahora también ítems borrados, 2FA, exportación y baja de clientes. ✅ `/api/audit` ya no deja falsificar autor ni restaurante. 🟡 la inmutabilidad real la da el trigger de `0003_audit_log_inmutable` (sin aplicar, 👤). |
| S8 | Secretos | ✅ | Historial completo de git (todas las ramas) revisado con los patrones de claves del CI: 0 hallazgos; solo valores de ejemplo (`cambiar-en-produccion`, `postgres:postgres@localhost` del docker-compose). No se usó la herramienta `gitleaks` (no instalada). Se quitó la clave `demo-key-123` que estaba escrita en la API `/api/v1`. |
| S9 | CORS y cabeceras | ✅ | Sin cabeceras CORS (solo mismo origen). `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, HSTS ya estaban. `public/.well-known/security.txt` creado: 👤 completar el mail. |
| S10 | Backups + restauración | ☐ | Workflow `backup-db.yml` y `docs/BACKUPS.md` listos, **sin ejecutar** (faltan 2 secretos, 👤). No hay Postgres ni Docker en esta máquina, así que no se pudo probar una restauración. Sin esa prueba no se vende. |
| S11 | Dependabot y CI | ✅ | `.github/dependabot.yml` semanal agrupado (máx. 3 PR). `npm audit --omit=dev --audit-level=high` bloquea el CI. |
| S12 | Datos personales | 🟡 | ✅ `GET/DELETE /api/clientes/[id]/datos`: exporta y anonimiza (cliente, pedidos con dirección/teléfono, reservas, favoritos), con auditoría y permisos. Sin datos personales en logs. ☐ texto legal de privacidad y términos: lo revisa un profesional (👤). |
| S13 | Revisión final | ✅ | Revisión manual de rutas (arriba) + pasada de seguridad sobre el diff completo de la rama (05/11): 0 hallazgos explotables de confianza alta. Observaciones menores abajo. La hizo la misma sesión que escribió el código, sin revisor independiente: conviene una segunda mirada humana antes de vender. |

## Hallazgos corregidos en esta revisión (por gravedad)
1. **`/api/pagos` sin aislamiento entre restaurantes.** Cualquier usuario con sesión podía cobrar el pedido de otro restaurante (`findUnique` por id) y `GET /api/pagos` listaba los pagos de todos. Ahora todo filtra por el restaurante de la sesión y valida la entrada (monto > 0, método permitido, uuid).
2. **`/api/audit` aceptaba `tenantId` y `usuarioId` del body.** Se podían escribir eventos falsos a nombre de otro. Ahora salen de la sesión.
3. **Clave de API fija `demo-key-123` en `/api/v1`** (apuntaba a un restaurante real y se aceptaba por la URL). Ahora las claves vienen de `API_V1_KEYS` (vacía = todo 401) y solo por cabecera.
4. **Pago duplicado por webhooks simultáneos** (WP-10): índice único + manejo del choque.
5. Cantidades negativas en ítems de pedido y movimientos de stock (precio/stock manipulables): ahora `cantidad ≥ 1` / `> 0`.
6. Estado de turnos (`turnoId` del body) modificable entre restaurantes: ahora se filtra por restaurante.
7. Webhook: el id va a una URL de MercadoPago → solo dígitos; si falla algo transitorio responde 500 (MP reintenta, es seguro por la idempotencia).

## Migraciones SQL pendientes de aplicar (👤, **no aplicadas a producción**)
`0002_pago_referencia_unica`, `0003_audit_log_inmutable`, `0004_usuario_2fa`. Aplicar con `npx prisma migrate deploy` después de un backup (S10) y de revisar duplicados (consulta incluida en `0002`). Hasta entonces el código nuevo falla al tocar las columnas nuevas (`referencia`, `totp_*`) — **no desplegar sin migrar**.

## Variables nuevas
`MERCADOPAGO_WEBHOOK_SECRET`, `API_V1_KEYS` (ver `.env.example`).

## Observaciones de la pasada de seguridad (S13), sin explotación concreta
- Activar el 2FA (`PUT /api/auth/2fa`) no vuelve a pedir la contraseña: quien robe una sesión viva podría enrolar su propio TOTP. Desactivarlo sí pide contraseña y código. Mejora pendiente: pedir contraseña también al activar.
- `GET /api/auth/refresh` tiene efecto (rota el token); un sitio ajeno puede dispararlo con una navegación, pero solo renueva la sesión de la propia víctima.
- `GET /api/clientes/[id]/datos` exporta datos personales con el permiso `clientes:leer`; si ese permiso llega a roles de salón conviene exigir uno propio.
- `/api/pagos` no pide un permiso por rol (cualquier usuario del restaurante con sesión puede cobrar); ya existía, ahora al menos queda dentro de su restaurante.

## Riesgos que quedan
- Límites de intentos en memoria del proceso (por instancia en Vercel).
- 2FA no obligatorio; secreto TOTP en claro en la fila (ver `shortcut:` en `2fa/route.ts`).
- `POST /api/cliente/pedido/[id]/pago` es público: quien conozca el id (uuid) de un pedido puede marcarlo pagado con efectivo/tarjeta/qr/transferencia sin comprobante (diseño de autoservicio en mesa). La caja debe cuadrar contra el posnet y MercadoPago; confirmar con el dueño si se acepta ese riesgo.
- Pagos parciales: `registrarPagoPedido` (webhook) devuelve «ya pagado» si el pedido ya tiene cualquier pago completado, aunque sea parcial.
