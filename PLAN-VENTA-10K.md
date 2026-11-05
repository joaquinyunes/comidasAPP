# Cozizina (restaurante) — plan de venta (03/11/2026)
Leé primero `..\PLAN-VENTA-10K.md` (veredicto, paquetes **S** y **V**). Rama: `integracion` (`96552d5` = perf + carta). Sin `git push`. **Base de datos de producción: Supabase `comida-app` — no tocar.**

**Frase de venta (a validar):** «Carta, pedidos y delivery propios para un restaurante, con pago por Mercado Pago que nunca cobra dos veces, sin comisión por pedido a una app.»

## Estado auditado
- ✅ carta con fotos reales, perf (1,61 MB → ≈ 0,89 MB por bytes) en `integracion` · 1 archivo sin commitear (`PLAN-POR-PROYECTO.md`)
- 🚨 **`npm audit`: 2 CRÍTICAS** (`next`, `proxy-addr`), 8 altas (`body-parser`, `sharp`, `undici`, `zod`, `systeminformation`, `shadcn`, `@modelcontextprotocol/sdk`, `source-map-js`), 9 moderadas, 1 baja → **la peor junto con sportcenter-pro**
- ☐ diseño a11y y seguridad CI sin fusionar · ☐ tests no re-corridos hoy
- ☐ **WP-10 sin empezar**: riesgo de **pago duplicado** por webhooks simultáneos
- ☐ «< 3 s» sin confirmar con throttling · ☐ decisión Postgres → MongoDB (go/no-go)

## A. Pasos
- [x] **Z1** 🤖 **S1 primero** (críticas): subir `next` y dependencias (`npm audit fix` no a ciegas; leer el changelog de Next); `npm run build`, `npm run lint`, `npm test`. — hecho 05/11: `next` 16.4.5, `zod` 4.6.7, sharp/undici/body-parser/proxy-addr vía `npm audit fix`; `npm audit --omit=dev` = 0 críticas, 0 altas (quedan 4 moderadas + 2 bajas, todas de `shadcn` CLI → fix solo con `--force` a shadcn 1.0.0, no aplicado); build, lint y 355 tests en verde.
- [ ] **Z2** 🤖 **WP-10 etapa 1**: test con dos webhooks simultáneos que muestre el pago duplicado → corregir con índice único pedido+referencia → tests del webhook (aprobado, pendiente, id inválido, reintento) y firma `x-signature` (S6).
- [ ] **Z3** 🤖 **WP-10 etapa 2**: informe go/no-go de Prisma/Postgres a MongoDB (modelo: commit `540f873` de sportcenter-pro). Solo informe; no migrar datos de producción.
- [ ] **Z4** 🤖 Fusionar `feat/diseno-a11y` → `chore/seguridad-ci` (y `fix/pago-unico` cuando exista); build, lint, tests.
- [ ] **Z5** 🤖 Seguridad de la app: JWT con `JWT_SECRET` fuerte y expiración corta + refresh, S3 rate limit (login, pedido, webhook), S4 2FA en `/dashboard`, S5, S7 auditoría (precio de carta, cancelaciones), S2, S8, S9, S10, S11, S12 (clientes y direcciones), S13.
- [ ] **Z6** 🤖 Diseño pendiente: decidir `prefers-reduced-motion` (testimonios sin botón de pausa), insignia de cámara de 28 px, aviso si la landing cae a datos de ejemplo, medir `/dashboard/*`, `/cliente`, `/pedir-local`.
- [ ] **Z7** 🤖 Medir con throttling de red (hoy «< 3 s» no está confirmado).
- [ ] **Z8** 🤖 **WP-24** `docs/BACKOFFICE.md` contra Fudo: stock de insumos, delivery y despacho, reportes de caja por turno.
- [ ] 👤 **Z9** Vercel: `DATABASE_URL`, `JWT_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`; unificar `.env` y `.env.local` · confirmar si se migra `comida-app` · privacidad y términos.

## B. Para vender (de `..\PLAN-VENTA-10K.md` §4)
- [ ] V1 paquetes · [ ] V2 tabla a 3 años contra Fudo/apps de delivery (comisión por pedido vigente) · [ ] V3 demo aparte (nunca la base de producción) · [ ] V4 despliegue repetible · [ ] V5 manual · [ ] V7 uptime · [ ] V8 página de venta · [ ] V10 restaurante piloto

## Salida
☐ 0 críticas y 0 altas ☐ webhook no duplica pagos (test en verde) ☐ build/lint/tests verdes ☐ portada < 1 MB ☐ informe go/no-go entregado ☐ backup restaurado
