# Segunda revisión de seguridad (independiente, solo lectura) — corregida el 17/11/2026

Una revisión externa encontró fallas reales que mi propia pasada (S13, `docs/SEGURIDAD.md`) no vio. Se corrigieron en la rama `feat/venta-fase2`, **con el test escrito antes** (se vio fallar) y verificado al final: `build` ✔, `lint` ✔, `npm test` **509 de 509**, `npm audit --omit=dev` **0 críticas, 0 altas** (4 moderadas de la herramienta `shadcn`).

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

## Lo que cambia para quien opera el sistema (leer antes de desplegar)
- **Los mozos y cocineros ya no pueden cobrar** (antes sí, por falta de control). Cobra el cajero, el gerente o el administrador.
- **El cliente que toca «Pagar la cuenta» desde la mesa ya no paga:** avisa al personal y el cobro se hace en el panel. El botón en `src/components/cliente/PagoMesa.tsx` todavía dice «Pagar la cuenta» (la respuesta aclara «Todavía no se cobró nada»): conviene renombrarlo a «Pedir la cuenta». Cambio visual pendiente.
- **Recuperar la clave por email no funciona en producción.** Para dar una clave nueva: `npx tsx scripts/nuevo-cliente/index.ts clave --email <mail> --confirmo-base <host de la base>` (con `DATABASE_URL` cargada); muestra la clave una sola vez y cierra las sesiones del usuario.
- **Los permisos viven en la base.** Los roles *nuevos* salen de `prisma/roles-base.ts`; los *existentes* de `comida-app` solo cambian con la migración `0006` (gerente). Revisar que los roles reales tengan lo que su gente necesita (`pagos:crear`, `caja:*`, `inventario:*`…); si no, esa persona recibe 403.

## Qué es del usuario (👤), en este orden
1. **Backup restaurable**, y después el **baseline de migraciones** (`docs/PENDIENTES-VENTA.md`: `migrate resolve` para `0001` y `0005`) y `migrate deploy` para `0002`, `0003`, `0004` y `0006`. No desplegar este código sin migrar.
2. **Variables en Vercel:**
   - `MERCADOPAGO_WEBHOOK_SECRET` — **obligatoria**: sin ella el webhook responde 500 y los pagos con Mercado Pago no se acreditan.
   - `QR_LOCAL_CODIGO` — renombrar la vieja y **cambiar el valor**: el anterior estuvo público en el JavaScript del sitio; hay que reimprimir el QR del local.
   - `IMAGENES_HOSTS` si hay fotos externas; `BOOTSTRAP_TOKEN` solo si se va a crear un primer usuario por la API; `SEED_PASSWORD` solo si se corre el seed.
3. Pasar la CSP a bloqueo cuando haya reportes (`docs/CSP-A-BLOQUEO.md`).
4. Elegir un proveedor de email para recuperar claves.
5. Probar el flujo completo con un pago real de Mercado Pago en modo prueba: aprobado, aviso repetido, monto menor.

## Lo que NO se hizo
- No se borró `src/lib/pedidos/pagar.ts` (la herramienta bloqueó el borrado): quedó vacío; `git rm` cuando quieras.
- Sin cobro real de Mercado Pago probado de punta a punta, y sin revisión externa de estos arreglos.
- `/api/pagos` sigue aceptando el `monto` que manda el personal (puede cobrar de menos o de más): falta validarlo contra el saldo.
- Las rutas `/api/personal/*`, `/api/feedback`, `/api/ia/*` y `/api/sectores` siguen pidiendo solo sesión (sin permiso por rol).
- El 2FA sigue siendo opcional y los límites de intentos viven en memoria por instancia.
