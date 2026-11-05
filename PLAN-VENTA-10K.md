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
- [x] **Z2** 🤖 **WP-10 etapa 1**: test con dos webhooks simultáneos que muestre el pago duplicado → corregir con índice único pedido+referencia → tests del webhook (aprobado, pendiente, id inválido, reintento) y firma `x-signature` (S6). — hecho 05/11: `tests/pagos-webhook-concurrente.test.ts` (rojo antes: 2 y 10 pagos; verde ahora), `Pago.referencia` + `@@unique([pedidoId, referencia])`, migración `prisma/migrations/0002_pago_referencia_unica` **sin aplicar a producción** (👤), `registrarPagoPedido` captura P2002, firma `x-signature` (`MERCADOPAGO_WEBHOOK_SECRET`, `lib/pagos/firma-webhook.ts`), id numérico, 500 en fallas transitorias para que MP reintente. 372 tests, build y lint verdes, audit prod 0 crít/0 altas.
- [x] **Z3** 🤖 **WP-10 etapa 2**: informe go/no-go de Prisma/Postgres a MongoDB (modelo: commit `540f873` de sportcenter-pro). Solo informe; no migrar datos de producción. — hecho 05/11: `docs/INFORME-MONGODB.md` → **NO-GO por ahora** (condicionado); 👤 confirmar en Z9.
- [x] **Z4** 🤖 Fusionar `feat/diseno-a11y` → `chore/seguridad-ci` (y `fix/pago-unico` cuando exista); build, lint, tests. — hecho 05/11: `chore/seguridad-ci` y `feat/diseno-a11y` fusionadas (sin conflictos) en `feat/venta-10k` (esas ramas están abiertas en otros worktrees, no las toqué); `fix/pago-unico` nunca existió: el arreglo de pagos está en esta rama (Z2). Build, lint y 372 tests verdes.
- [ ] **Z5** 🤖 Seguridad de la app: JWT con `JWT_SECRET` fuerte y expiración corta + refresh, S3 rate limit (login, pedido, webhook), S4 2FA en `/dashboard`, S5, S7 auditoría (precio de carta, cancelaciones), S2, S8, S9, S10, S11, S12 (clientes y direcciones), S13. — **parcial 05/11** (detalle en `docs/SEGURIDAD.md`): ✅ S1, S3, S4 (JWT 15 min + refresco, 2FA opcional, bloqueo), S5, S6, S7, S8, S9, S11 · 🟡 S12 (exportar/anonimizar listo; falta texto legal 👤) · ☐ S2 (esperar reportes CSP), S10 (faltan secretos de GitHub 👤 y una restauración real), S13 (falta `/security-review` final). Migraciones 0002–0004 sin aplicar (👤).
- [x] **Z6** 🤖 Diseño pendiente: decidir `prefers-reduced-motion` (testimonios sin botón de pausa), insignia de cámara de 28 px, aviso si la landing cae a datos de ejemplo, medir `/dashboard/*`, `/cliente`, `/pedir-local`. — hecho 05/11 (`docs/DISENO.md`): reduced-motion decidido (3D sigue; testimonios con pausa y sin autoarranque), insignia con área de 44 px, aviso de datos de ejemplo, panel a 44 px en celular; medidas 9 páginas (13 pantallas del panel no se abrieron una por una). Los testimonios de la landing son inventados: 👤 reemplazar.
- [x] **Z7** 🤖 Medir con throttling de red (hoy «< 3 s» no está confirmado). — hecho 05/11 (`docs/RENDIMIENTO.md`): Slow 4G + CPU 4× en 6 rutas, todas con `load` < 3 s y LCP ≤ 2,1 s. Es localhost sin BD: producción no re-medida (👤 repetir tras el despliegue).
- [x] **Z8** 🤖 **WP-24** `docs/BACKOFFICE.md` contra Fudo: stock de insumos, delivery y despacho, reportes de caja por turno. — hecho 05/11: `docs/BACKOFFICE.md` (brechas contra Fudo según su sitio, sin probar su producto). Hallazgo: la tabla `Caja` existe pero nada abre ni cierra turnos. 👤 decidir construir vs integrar Fudo.
- [ ] 👤 **Z9** Vercel: `DATABASE_URL`, `JWT_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`; unificar `.env` y `.env.local` · confirmar si se migra `comida-app` · privacidad y términos.

## B. Para vender (de `..\PLAN-VENTA-10K.md` §4)
- [ ] V1 paquetes · [ ] V2 tabla a 3 años contra Fudo/apps de delivery (comisión por pedido vigente) · [ ] V3 demo aparte (nunca la base de producción) · [ ] V4 despliegue repetible · [ ] V5 manual · [ ] V7 uptime · [ ] V8 página de venta · [ ] V10 restaurante piloto

## Salida
☐ 0 críticas y 0 altas ☐ webhook no duplica pagos (test en verde) ☐ build/lint/tests verdes ☐ portada < 1 MB ☐ informe go/no-go entregado ☐ backup restaurado
