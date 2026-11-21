# Entorno de demo (V3)

Para mostrar el sistema a un cliente **nunca** se usa el restaurante real: se levanta un despliegue **aparte** con su propia base y datos de ejemplo.

## Cómo está protegido (verificado en local, 21/11/2026)
- `DEMO_MODE=1` (variable de **build** del proyecto de demo) muestra un cartel fijo amarillo «DEMO — datos de ejemplo» en todo el sitio.
- **El seed** (`prisma/seed.ts`) solo corre contra una base local, o contra una base remota si pasás `--confirmo-base <host>` **y** el nombre de la base o el host incluye «demo». Contra `comida-app` (o cualquier base sin «demo») se niega siempre.
- `node scripts/verificar-despliegue.mjs --env <archivo>` falla si `DEMO_MODE=1` y la base no es de demo.
- `scripts/prueba-local/demo.mts` repite todo esto en un Postgres temporal: seed negado contra base remota ajena, build con `DEMO_MODE=1`, cartel visible, 17 productos de ejemplo y login demo (`admin@cozizina.com` / clave de demostración del seed).

## Pasos para publicarlo (👤 las cuentas; el resto lo hace una sesión)
1. 👤 Proyecto de Supabase **nuevo** llamado `cozizina-demo` (el nombre debe incluir «demo») y proyecto de Vercel **aparte**. **Nunca** `comida-app`.
2. Variables del proyecto de Vercel de demo: `DEMO_MODE=1`, `DATABASE_URL` (la de `cozizina-demo`), `TENANT_SLUG=pizzaria-demo`, un `JWT_SECRET` propio, `QR_LOCAL_CODIGO` propio. **Sin** credenciales reales de Mercado Pago (sin `MERCADOPAGO_ACCESS_TOKEN`, o uno de modo prueba).
3. `DATABASE_URL=<demo> npx prisma migrate deploy` y luego `DATABASE_URL=<demo> npx tsx prisma/seed.ts --confirmo-base <host de la base demo>`.
4. `node scripts/verificar-despliegue.mjs --env <archivo-demo>` debe dar «Listo para desplegar».
5. Poner la URL del demo en `ventas/index.html` (sección Demo).

El administrador del demo debe activar el 2FA al entrar (es obligatorio en producción también acá); el seed usa una clave de demostración conocida: **por eso la base tiene que ser descartable**.
