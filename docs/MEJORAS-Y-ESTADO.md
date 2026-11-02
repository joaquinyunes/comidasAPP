> Archivo vivo: qué se hizo y qué falta en este proyecto. Misma base que `soluciones-repos/ESTADO-PROYECTOS/comidas-cozizina.md` (31/10/2026). Cada sesión lo actualiza al terminar.

# comidas-cozizina (restaurante, Next.js + Prisma + Supabase Postgres) — rama de trabajo `perf/movil` · `485591a`

## Hecho
- Panel con datos reales (rama `feat/panel-rediseno`), carta/nosotros con la paleta del home (`feat/carta-nosotros-pop-fluido`).
- Revisé el webhook de pagos: no confía en el cuerpo, vuelve a consultar a Mercado Pago, `registrarPagoPedido` es idempotente por pedido.
- Base actual: Supabase `comida-app` (**activo, producción: no tocar**).

## ⚠️ Riesgo
**17 archivos sin commitear** (carta, landing, `FotoReal`, `public/assets/real/*.webp`...). El árbol está en `perf/movil`, donde trabaja WP-42. Esperar y commitear después.

## Falta (código) — nada empezado
- **WP-10:** pasar de Prisma/Postgres a **MongoDB** (con compuerta go/no-go, modelo: commit `540f873` de sportcenter-pro) y corregir la **carrera de pagos duplicados** (índice único pedido + referencia, test con dos webhooks simultáneos, tests del webhook).
- **WP-24:** `docs/BACKOFFICE.md` contra **Fudo** (stock de insumos, delivery y despacho, reportes de caja por turno, adaptador solo si Fudo confirma API).
- Peso de 1,6 MB y 16 de 49 controles chicos (WP-40/42, en curso).

## Te toca a vos
1. Decidir si de verdad se migra `comida-app` a MongoDB (el dueño pidió todo en MongoDB; la compuerta go/no-go sigue vigente).
2. Unificar `.env` y `.env.local`; cargar `DATABASE_URL`, `JWT_SECRET`, `MERCADOPAGO_ACCESS_TOKEN` en Vercel.
3. Privacidad y términos (se guardan datos personales).

## Plataformas hoy
Vercel `cozizina` (200, 1,7 s, 1,6 MB). Supabase `comida-app` activo.
