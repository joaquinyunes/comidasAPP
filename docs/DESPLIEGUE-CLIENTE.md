# Despliegue repetible: un restaurante nuevo (V4)

Objetivo: dejar andando una instancia para un cliente nuevo en **menos de 1 hora**, con todo **a nombre del cliente**. Los tiempos de abajo son **estimaciones**, no mediciones.

> **Estado de la prueba (05/11/2026): NO probado de cero.** Se probaron por separado y con tests el generador de secretos, la creación de la base mínima (con una base falsa) y la guarda contra escribir en la base equivocada. **No se creó ningún proyecto real en Supabase ni en Vercel** (requiere cuentas del cliente y costo), ni se corrió `prisma migrate deploy` sobre una base vacía (no hay Postgres en la máquina de desarrollo). Antes de prometer «< 1 hora» hay que hacer **una corrida real** con cuentas de prueba y anotar el tiempo en la tabla del final.

## Antes de empezar (lo pone el cliente, 👤)
- Cuenta de **GitHub** del cliente (o un repositorio que él pueda heredar), cuenta de **Vercel** y de **Supabase** a su nombre y con su medio de pago. Vercel **Hobby no sirve** (uso no comercial); hace falta Pro. Supabase **Free no tiene backups y se pausa**; hace falta Pro. Costos: `docs/VENTA-PRECIOS.md`.
- Dominio (o un subdominio) y acceso al DNS.
- Para cobrar: cuenta de Mercado Pago con su **Access Token** y la **clave secreta de webhooks**.

## Pasos (≈ tiempo estimado)
1. **Código** (5 min). Clonar el repo y `npm ci`. Trabajar sobre la rama estable, nunca sobre `feat/venta-10k` mientras tenga migraciones sin aplicar a otros clientes.
2. **Secretos** (2 min). `npx tsx scripts/nuevo-cliente/index.ts env --slug <slug-del-restaurante>` escribe `.env.cliente-<slug>` con `JWT_SECRET` y el código QR nuevos (no se imprimen). El archivo está ignorado por git. Completar los valores que dicen `COMPLETAR`.
3. **Base de datos** (10 min). En Supabase del cliente: proyecto nuevo, región más cercana, copiar la cadena de conexión del *pooler* y pegarla en `DATABASE_URL`. **Debe ser una base vacía y nueva**: jamás la de otro cliente ni `comida-app`.
4. **Esquema** (3 min). `DATABASE_URL=… npx prisma migrate deploy` (aplica `0001` a `0004`).
5. **Restaurante y administrador** (2 min). `DATABASE_URL=… npx tsx scripts/nuevo-cliente/index.ts base --slug <slug> --nombre "<Nombre>" --sucursal "<Sucursal>" --email <mail-del-dueño> --confirmo-base <host de la base>`. Crea tenant, sucursal, roles y el administrador **sin datos de ejemplo**. La clave inicial se muestra **una sola vez** en la terminal: entregársela al dueño por un canal privado y pedirle que la cambie en *Mi cuenta* y active el 2FA.
6. **Vercel** (15 min). Importar el repositorio, cargar las variables de `.env.cliente-<slug>` (Production), build por defecto (`npm run build`), asignar el dominio. Si hay Mercado Pago: en su panel, URL de notificaciones `https://<dominio>/api/pagos/mercadopago/webhook` y pegar la clave secreta en `MERCADOPAGO_WEBHOOK_SECRET`.
7. **Backups y monitoreo** (10 min). En el repo del cliente, secretos `BACKUP_DATABASE_URL` y `BACKUP_PASSPHRASE` y variable `SITE_URL`; correr a mano los workflows *Backup de la base* y *Disponibilidad del sitio* (`docs/BACKUPS.md`, `scripts/uptime.sh`). **No entregar sin una restauración exitosa.**
8. **Carga inicial** (variable). Carta, mesas, zonas de reparto y usuarios desde el panel. No existe todavía un importador de planilla (ver `docs/BACKOFFICE.md`).

## Chequeo de entrega (marcar todo antes de dar el sistema por entregado)
- [ ] `https://<dominio>/api/salud` responde `{"ok":true}`.
- [ ] La portada carga y **no muestra** el aviso de «datos de ejemplo» (hay carta real).
- [ ] El dueño entra, cambia su clave y activa el 2FA.
- [ ] Se hace un pedido de prueba por QR de mesa y por `/ordenar`, llega a Cocina y se cobra.
- [ ] Con Mercado Pago en modo prueba: pago aprobado → pedido pagado **una sola vez** (repetir el aviso desde el panel de MP y verificar que no duplica).
- [ ] Workflow de backup corrió y la prueba de restauración salió verde; resultado anotado en `docs/BACKUPS.md`.
- [ ] Workflow de disponibilidad en verde; el dueño tiene activadas las notificaciones de Actions.
- [ ] Cuentas y dominio **a nombre del cliente**; credenciales entregadas por canal seguro; el estudio no conserva claves.
- [ ] Se entregó el manual (`docs/MANUAL-DEL-RESTAURANTE.md`) y se hizo la capacitación.

## Registro de corridas reales
| Fecha | Quién | Tiempo total | Qué falló / qué se corrigió |
|---|---|---|---|
| _(pendiente: primera corrida de prueba)_ | | | |

## Si algo sale mal
- `prisma migrate deploy` falla: la base no estaba vacía o la cadena de conexión es del *pooler de transacciones* (usar la de sesión o la directa para migrar).
- El administrador no puede entrar: `TENANT_SLUG` en Vercel no coincide con el `--slug` usado en el paso 5.
- Pagos aprobados que no aparecen: revisar `MERCADOPAGO_ACCESS_TOKEN`, la URL del webhook y los logs de la función (`[mp/webhook]`).
