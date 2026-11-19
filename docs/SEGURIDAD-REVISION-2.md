# Segunda revisión de seguridad (independiente, solo lectura) — corregida el 17/11/2026

Una revisión externa encontró fallas reales que mi propia pasada (S13, `docs/SEGURIDAD.md`) no vio. Se corrigieron en la rama `feat/venta-fase2`, **con el test escrito antes** (se vio fallar) y verificado al final: `build` ✔, `lint` ✔, `npm test` **626 de 626** (tras la tercera tanda), `tsc` ✔, `npm audit --omit=dev` **0 vulnerabilidades** (la herramienta `shadcn` pasó a `devDependencies`). Ensayo de despliegue de cero en Postgres 18 real (`scripts/prueba-local/despliegue-de-cero.mts`, 7 migraciones, sin deriva, build de producción): **todas las comprobaciones en verde**, incluido «administrador sin 2FA → 403 hasta activarlo».

| # | Gravedad | Hallazgo | Arreglo | Commit |
|---|---|---|---|---|
| 1 | **CRÍTICA** | `POST /api/cliente/pedido/[id]/pago` (pública) marcaba el pedido **pagado** y liberaba la mesa con `{"metodo":"qr"}` sin cobro real | La ruta solo **pide la cuenta**: registra el evento `CUENTA_SOLICITADA` y avisa al personal; nunca crea pagos ni cambia el estado ni libera la mesa. El cobro lo carga el panel (`/api/pagos`) o el webhook firmado. `src/lib/pedidos/pagar.ts` quedó vacío | `dafb582` |
| 2 | ALTA | Solo ~11 handlers miraban permisos: un mozo podía cobrar, ver auditoría, tocar cupones, compras o RRHH | `proxy.ts` exige permiso por **método** (GET leer, POST crear, PUT/PATCH actualizar, DELETE eliminar) en pagos, pedidos, cocina, delivery, mesas, reservas, caja, inventario, compras, clientes, marketing, RRHH, reportes, dueño, configuración y auditoría (`src/lib/auth/permiso-ruta.ts`). En `PUT /api/pedidos/[id]`: **«pagado» ya no se puede forzar**; «cerrado» y «cancelado» piden `pedidos:eliminar` o `pagos:crear`. Migración `0006` da `inventario:*` y `compras:*` a los gerentes ya creados (probada en Postgres real, idempotente) | `0716bf2` |
| 3 | ALTA | El webhook de MP aceptaba avisos sin firma si faltaba el secreto; marcaba pagado con cualquier monto; dos pagos con distinta referencia se pisaban | Sin `MERCADOPAGO_WEBHOOK_SECRET` en producción responde **500** (falla cerrado; MP reintenta). `registrarPagoPedido` toma el pedido con `SELECT … FOR UPDATE` y calcula el saldo adentro de la transacción: solo salda si lo cobrado cubre el saldo; un pago menor queda `PAGO_PARCIAL` con aviso; un pago aprobado sobre un pedido ya saldado deja `PAGO_MP_SOBRANTE` y aviso, **sin segundo pago**. Verificado en Postgres 18 real | `0619566` |
| 4a | MEDIA | `NEXT_PUBLIC_QR_LOCAL_CODIGO` viajaba en el JavaScript de todo el sitio | Ahora `QR_LOCAL_CODIGO` (solo servidor), comparado con `timingSafeEqual`; el panel de mesas lo recibe por prop de servidor; tope de 30 pedidos cada 10 minutos por mesa. La variable vieja todavía se lee **solo del lado servidor**: conviene renombrarla | `566e6d6` |
| 4b | MEDIA | El enlace de recuperación de clave se escribía en los logs | En producción **no se escribe ni se genera** el token (no existe canal de envío). La recuperación por email queda **deshabilitada** en producción hasta enganchar un proveedor; mientras tanto, por línea de comandos (ver abajo) | `566e6d6` |
| 4c | MEDIA | El seed cargaba usuarios demo con `admin123` también en producción | `claveDelSeed` aborta en producción sin `SEED_PASSWORD` de 12+ caracteres | `566e6d6` |
| 5a | BAJA | Redirección abierta en el login (`callbackUrl`) | Solo rutas del panel (`destinoSeguro`) | `86a029d` |
| 5b | BAJA | `remotePatterns` con `**` (proxy de imágenes abierto) | Solo los dominios de `IMAGENES_HOSTS` (vacío = solo imágenes propias) | `86a029d` |
| 5c | BAJA | `rolId` sin validar contra el restaurante | Debe ser uuid y rol **del mismo restaurante** | `86a029d` |
| 5d | BAJA | Reservas públicas sin largos máximos ni formato | nombre ≤ 100, teléfono ≤ 30, notas ≤ 500, email ≤ 255, fecha AAAA-MM-DD, hora HH:MM | `86a029d` |
| 5e | BAJA | Cualquiera podía crear el primer usuario de un restaurante vacío | Solo con el `BOOTSTRAP_TOKEN` del servidor y un rol válido; sin la variable, queda cerrado | `86a029d` |

## Segunda tanda (19/11/2026): lo que quedaba pendiente, cerrado

| # | Tema | Qué se hizo | Cómo se verificó |
|---|---|---|---|
| 6 | `pagar.ts` | `git rm src/lib/pedidos/pagar.ts` (no lo importaba nadie) | `tsc` limpio |
| 7 | Botón de la mesa | «Pagar la cuenta» → **«Pedir la cuenta»** (y «Pedir el resto de la cuenta»); el comentario de `pagarPedido.ts` ya no dice que cobra | texto en `PagoMesa.tsx` |
| 8 | `/api/pagos` y el monto | El saldo se lee **dentro de la transacción con el pedido bloqueado** (`FOR UPDATE`). Cobrar **de más** → 409; cobrar **de menos** → 422 salvo que el cobro venga marcado `parcial: true` con un `motivo` (queda en el evento `PAGO_PARCIAL`; el pedido sigue abierto y la mesa ocupada); propina mayor que el consumo → 422; pedido cancelado → 409; ya saldado → respuesta idempotente. Lógica pura en `src/lib/pedidos/validar-cobro.ts` | `tests/validar-cobro.test.ts` (9) y `tests/pagos-monto-saldo.test.ts` (8) |
| 9 | Permiso por rol en el resto de la API | `/api/personal/fichaje`, `/rendimiento`, `/checklists/ejecuciones` y crear plantillas → `rrhh`; `/api/feedback` y `/api/ia` → `reportes`; `/api/sectores` → `config` (igual que sus pantallas). **Siguen abiertos a cualquier sesión** solo ver/ejecutar checklists (cada persona hace su tarea). **No hizo falta migración**: ningún rol base tenía esas pantallas | `tests/permiso-ruta.test.ts`, `tests/proxy-permisos.test.ts` (mozo, cocinero y cajero → 403) |
| 10 | Contadores en base de datos | Tabla `intentos_fallidos` (migración **`0007`**, idempotente) con conteo atómico (`INSERT … ON CONFLICT`): bloqueo de **login** (5 fallos/15 min por cuenta), de **código 2FA** (5/15 min por usuario, en activar y desactivar) y del **QR del local** (10 códigos incorrectos/10 min por IP y 30 pedidos/10 min por mesa). Valen igual con varias instancias | `scripts/prueba-local/limite-intentos.mts` contra **Postgres 18 real**: 50 intentos simultáneos cuentan 50, ventana que se reinicia, bloqueos separados |
| 11 | 2FA obligatorio para el administrador | En **producción** (o con `ADMIN_2FA_OBLIGATORIO=1`) el rol con permiso `*` que no tiene 2FA recibe una sesión marcada `debe2fa`: el proxy solo lo deja entrar a **Mi cuenta** (y `/api/auth`) hasta activarlo; al activarlo se reemite la sesión sin la marca. **No puede desactivarlo.** Si pierde el celular: `clave … --reiniciar-2fa si` (ver abajo) | `tests/auth-2fa-admin.test.ts` (9) |
| 12 | `scripts/verificar-despliegue.mjs` | Antes de desplegar comprueba `DATABASE_URL`, `JWT_SECRET` fuerte, `MERCADOPAGO_WEBHOOK_SECRET`, `QR_LOCAL_CODIGO`, `MERCADOPAGO_ACCESS_TOKEN`, que **no** exista `NEXT_PUBLIC_QR_LOCAL_CODIGO`, y que **todas** las migraciones del repo (0001–0007) figuren aplicadas en la base (consulta de solo lectura + `prisma migrate status`). No imprime secretos; sale con código 1 si algo obligatorio falla | `tests/verificar-despliegue.test.ts` (9) y `scripts/prueba-local/verificar-despliegue.mts` contra Postgres real: base sin `_prisma_migrations` → falla y explica el baseline; al día → ok; 0007 sin registrar → falla y la nombra; no escribe nada |

Uso: `node scripts/verificar-despliegue.mjs --env .env.cliente-<slug>` (o sin `--env` con las variables del entorno; `--sin-base` para omitir la base).

## Tercera tanda (19/11/2026): hallazgos de la segunda revisión independiente

La segunda revisión confirmó cerrados lo crítico y lo alto (pago público, webhook, permisos por rol, `/api/pagos`) y dejó estos puntos medios y bajos. Todos con test antes del cambio.

| # | Hallazgo | Arreglo | Verificación |
|---|---|---|---|
| M1 | El webhook pagaba pedidos **cancelados** | `registrarPagoPedido`: pedido cancelado = «sobrante» (evento `PAGO_MP_SOBRANTE` motivo `pedido_cancelado` + aviso; **no** crea pago ni reabre). La preferencia de pago rechaza pedidos cancelados (409) | `pagos-webhook-concurrente`, `pago-mercadopago-preferencia` |
| M2 | El cobro no guardaba quién lo hizo | `/api/pagos`: `usuarioId` en el pago y en el evento, y fila de **AuditLog** (`Pago`, `create`) en la misma transacción; el cobro parcial incluye el motivo | `pagos-monto-saldo` |
| M3 | `/api/dashboard/resumen` mostraba ventas a cualquiera | Sin `reportes:leer` devuelve solo lo operativo (mesas, pedidos abiertos, stock crítico; ventas y clientes en 0, `soloOperativo: true`, ni siquiera consulta pagos) y la pantalla oculta las cifras de plata | `dashboard-resumen-permiso` |
| M4 | `/api/personal/*` | Todo bajo `rrhh` (cerrado por defecto, también las rutas nuevas). Quedan **para todo el personal** solo: fichar (`POST fichaje`), ver las checklists y ejecutarlas | `permiso-ruta-revision2` |
| M5 | `/api/mesas`, `salon`, `mozo` | Sin «escritura = actualizar»: crear pide `mesas:crear`, borrar `mesas:eliminar`; el cambio de estado (`PATCH/PUT`) sigue siendo `mesas:actualizar` (el mozo lo tiene) | ídem |
| M6 | `PUT /api/pedidos/[id]` y `delivery/asignar` | `puedeTransicionarPedido`: un pedido **pagado o cancelado no se modifica** (ni estado ni ítems; agregar ítems a uno pagado también se rechaza). Asignar reparto lo respeta | `transicion-permitida`, `pedidos-estado-y-reparto` |
| M7 | Ids sin validar contra el restaurante | `delivery/asignar` (empleado y zona), `reservas` y `inventario` (sucursal del cuerpo; proveedor), `compras/ordenes` (cada ingrediente): `findFirst/count({ id, tenantId })`, 404 si es ajeno | `ids-del-tenant` |
| M8 | `/api/v1/pedidos` | Mesa y productos filtrados por `auth.tenantId`; 400 si falta un producto (antes creaba el pedido a precio 0) | `v1-pedidos-tenant` |
| M9 | El seed | Aborta si el host de `DATABASE_URL` no es local, salvo `--confirmo-base <host>` (`verificarBaseDelSeed`, antes de tocar nada); **ya no pisa** el `passwordHash` de usuarios existentes | `seed-guard` |
| M10 | QR del local | El restaurante sale siempre de `TENANT_SLUG` (se ignora `tenant` del cuerpo). El tope ya no depende de la `referencia` (texto libre): se cuenta por **mesa normalizada** («Mesa 5» = «mesa-5»), por **IP** (30 / 10 min) y para **todo el local** (300 / 10 min), en la base | `cliente-local-qr`, `limite-qr` |
| B2/B3 | `sectores`, `feedback`, `ia` | `/api/sectores` → `mesas`; `/api/feedback` y `/api/ia` → `reportes` | `permiso-ruta-revision2` |
| B5 | `/api/v1` lo frenaba el proxy antes de leer `X-API-Key` | `/api/v1` es pública para el proxy y cada ruta exige su clave; probado **pasando por el proxy** (con clave, sin clave → 401, y una sesión JWT no abre `/api/v1`) | ídem |
| B6 | `refunded` / `charged_back` y moneda | Nuevo `revertirPagoPedido`: el pago pasa a «reembolsado» (la caja deja de contarlo), el pedido «pagado» vuelve a «entregado» con saldo y se avisa; idempotente. Un pago aprobado en moneda distinta de ARS **no se registra** (queda en el log) | `pagos-webhook-concurrente`, `mp-webhook` |
| B7 | `external_reference` | Debe ser un **uuid real** (`z.uuid()`), no cualquier cadena de 36 caracteres | `mp-webhook` |
| B8 | La preferencia cobraba el total | Cobra el **saldo pendiente** (la propina se calcula sobre el saldo); sin saldo → 409 | `pago-mercadopago-preferencia` |
| B9 | Pedido en $0 (cupón del 100 %) | Puede pasar a «pagado» sin cobro (no hay nada que cobrar); con saldo sigue siendo 409. Los pagos reembolsados ya no suman en el resumen del día | `transicion-permitida`, `pedidos-estado-y-reparto` |
| B10 | El login no resolvía el restaurante | Login y recuperación buscan al usuario con `tenant: { slug: TENANT_SLUG }` | `auth-reset-confirmar-y-tenant` |
| B11 | Slug fijo `pizzaria-demo` y hora `99:99` | Reservas, landing, zonas, cupón y pedidos públicos usan `TENANT_SLUG` y no aceptan `tenant` del visitante. Fecha y hora se validan de verdad (`99:99`, `24:00`, `2026-02-31` → 400; antes Invalid Date → 500), también en la reserva interna | `tenant-fijo-y-fechas` |
| B12 | Límites de intentos en la base | Ya hecho en la segunda tanda (login, 2FA, QR con `intentos_fallidos`); ahora también el tope por IP, por mesa y del local | `limite-intentos.mts` (Postgres real) |
| B14 | `reset/confirmar` | Responde 403 en producción (sin canal de email no hay token legítimo); en desarrollo sigue andando | `auth-reset-confirmar-y-tenant` |

`scripts/verificar-despliegue.mjs` ahora también exige `TENANT_SLUG` y que ese restaurante **exista y esté activo** en la base (probado en Postgres real: sin el restaurante, «NO desplegar»).

### Lo que cambia al desplegar esta tanda
- **`TENANT_SLUG` pasa a ser obligatorio en la práctica**: tiene que ser el `slug` del restaurante en la base. Si queda sin cargar, la app busca «pizzaria-demo» y **nadie del restaurante real podría iniciar sesión**. Comprobarlo con `verificar-despliegue.mjs`.
- Quien use el seed contra una base remota debe agregar `--confirmo-base <host>`.
- Un reembolso o contracargo de Mercado Pago deja el pedido otra vez con saldo y un aviso: hay que cobrarlo de nuevo o resolverlo.

## Lo que cambia para quien opera el sistema (leer antes de desplegar)
- **Los mozos y cocineros ya no pueden cobrar** (antes sí, por falta de control). Cobra el cajero, el gerente o el administrador.
- **El cliente que toca «Pagar la cuenta» desde la mesa ya no paga:** avisa al personal y el cobro se hace en el panel. El botón en `src/components/cliente/PagoMesa.tsx` todavía dice «Pagar la cuenta» (la respuesta aclara «Todavía no se cobró nada»): conviene renombrarlo a «Pedir la cuenta». Cambio visual pendiente.
- **Recuperar la clave por email no funciona en producción.** Para dar una clave nueva: `npx tsx scripts/nuevo-cliente/index.ts clave --email <mail> --confirmo-base <host de la base>` (con `DATABASE_URL` cargada); muestra la clave una sola vez y cierra las sesiones del usuario.
- **Cobros desde el panel:** el monto tiene que coincidir con el saldo. Si un pedido ya tiene un cobro parcial, el botón «Cobrar» de la lista (que manda el total del pedido) responde 409 con el saldo: cobrar el resto desde el cobro parcial o ajustar el monto. Para cobrar menos que el saldo hay que mandar `parcial: true` y un `motivo` (el panel todavía no tiene ese campo: hoy solo la API).
- **El administrador debe activar el 2FA** en su primer ingreso en producción (queda en *Mi cuenta* hasta hacerlo). Perdió el celular: `npx tsx scripts/nuevo-cliente/index.ts clave --email <mail> --confirmo-base <host> --reiniciar-2fa si`.
- **Los permisos viven en la base.** Los roles *nuevos* salen de `prisma/roles-base.ts`; los *existentes* de `comida-app` solo cambian con la migración `0006` (gerente). Revisar que los roles reales tengan lo que su gente necesita (`pagos:crear`, `caja:*`, `inventario:*`…); si no, esa persona recibe 403.

## Qué es del usuario (👤), en este orden
1. **Backup restaurable**, y después el **baseline de migraciones** (`docs/PENDIENTES-VENTA.md`: `migrate resolve` para `0001` y `0005`) y `migrate deploy` para `0002`, `0003`, `0004`, `0006` y `0007`. No desplegar este código sin migrar. Comprobarlo con `node scripts/verificar-despliegue.mjs --env <archivo>`.
2. **Variables en Vercel:**
   - `MERCADOPAGO_WEBHOOK_SECRET` — **obligatoria**: sin ella el webhook responde 500 y los pagos con Mercado Pago no se acreditan.
   - `QR_LOCAL_CODIGO` — renombrar la vieja y **cambiar el valor**: el anterior estuvo público en el JavaScript del sitio; hay que reimprimir el QR del local.
   - `IMAGENES_HOSTS` si hay fotos externas; `BOOTSTRAP_TOKEN` solo si se va a crear un primer usuario por la API; `SEED_PASSWORD` solo si se corre el seed.
3. Pasar la CSP a bloqueo cuando haya reportes (`docs/CSP-A-BLOQUEO.md`).
4. Elegir un proveedor de email para recuperar claves.
5. Probar el flujo completo con un pago real de Mercado Pago en modo prueba: aprobado, aviso repetido, monto menor.

## Lo que NO se hizo
- Sin cobro real de Mercado Pago probado de punta a punta, y **sin revisión externa de estos arreglos** (hay una segunda revisión independiente en curso).
- El panel de cobro **no tiene todavía** el campo «cobro parcial + motivo» (la API sí): hoy se cobra el saldo completo desde la pantalla.
- Los roles *existentes* de producción siguen con los permisos que tengan en la base (solo `Gerente` se completó con `0006`): revisarlos.
- Los permisos de `rrhh`, `config` y `reportes` no están en el rol `Gerente` base (tampoco lo estaban sus pantallas): si el gerente debe ver feedback, rendimiento del personal o sectores, hay que dárselos a mano.
- El secreto del 2FA se guarda en claro en la fila del usuario (ver `shortcut:` en `2fa/route.ts`); activar el 2FA no vuelve a pedir la contraseña.
- Los límites generales por IP del resto de la API (`rate-limit.ts`, p. ej. el de 20/min del pedido en mesa, la recuperación de clave o el registro) siguen en memoria por instancia; solo login, 2FA y QR pasaron a la base.
- `POST /api/personal/fichaje` está abierto a todo el personal y acepta cualquier `empleadoId` del restaurante (un mozo podría fichar a otro): falta limitarlo al propio empleado.
- Un reembolso **parcial** de Mercado Pago (el pago sigue «approved») no se descuenta: solo se revierten `refunded` y `charged_back`.
- `rrhh`, `config` y la escritura de reportes no están en el rol base «Gerente»: hoy solo el administrador las usa.
- La recuperación de clave por email sigue deshabilitada en producción (no hay proveedor de email).
