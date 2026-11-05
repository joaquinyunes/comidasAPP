# Informe go/no-go — pasar Cozizina de Prisma/Postgres a MongoDB (WP-10 etapa 2)

Fecha: 05/11/2026 · Solo informe. **No se migró ni se tocó ningún dato**; la base de producción (Supabase `comida-app`) queda como está.
Modelo de comparación: commit `540f873` de sportcenter-pro («migrar la base de datos de postgres a mongodb»).

## Veredicto: **NO-GO por ahora** (condicionado, ver «Qué cambiaría el voto»)

Motivo corto: la migración no resuelve ningún problema que hoy tenga Cozizina y agrega riesgo justo en lo que se vende (pagos y stock sin duplicados). El problema real de WP-10 —el pago duplicado— ya está corregido en Postgres con un índice único (migración `0002_pago_referencia_unica`, test en verde).

## Qué se midió en el repo (hoy)

| Dato | Cozizina | sportcenter-pro (ya migrado, medido hoy) |
|---|---|---|
| Modelos Prisma | 50 | 38 |
| Relaciones `@relation` | 66 | 54 |
| Campos `@db.Uuid` (pasan a `ObjectId`) | 180 | 0 (ya migrado a ObjectId) |
| Campos `Decimal` (pasan a `Float`/centavos) | 39 | 0 (ya migrado a Float) |
| `$transaction` en el código | 8 archivos (pedidos, pagos, inventario, reset de clave) | 11 |
| Validadores Zod `.uuid()` a reescribir | 48 | — |
| `include:` anidados / `findMany` | 73 / 89 | — |
| Agregaciones (`groupBy`/`aggregate`) en reportes | 5 usos en 4 archivos | — |
| SQL crudo (`$queryRaw`) | 0 | — |
| Funciones/triggers/RLS en la migración 0001 | 0 | — |

Lectura: no hay SQL crudo ni lógica en la base, lo que **facilita** migrar. Pero el volumen (50 modelos, 180 ids, 39 montos) es mayor que el del proyecto modelo.

## Hechos técnicos verificados
- Prisma **7.10.1** acepta `provider = "mongodb"`: `prisma validate` sobre un schema mínimo da válido (comprobado hoy en un directorio temporal). **No** se probó `generate` ni el cliente contra un Mongo real; sportcenter-pro usa Prisma 5.22, así que su commit no demuestra que el cliente de Prisma 7 con adaptadores funcione igual en Mongo.
- Hoy el cliente se arma con `@prisma/adapter-pg` + `pg` (`src/lib/prisma.ts`): ese archivo se reescribe entero.
- Transacciones multi-documento en MongoDB exigen replica set (Atlas lo trae; el `docker-compose` local no).

## Riesgos de migrar (por qué NO)
1. **Dinero en `Float`.** 39 columnas `Decimal(10,2)` (precios, pagos, propinas, caja) pasarían a `Float` o a enteros en centavos. Con `Float` aparecen errores de redondeo en totales y cierres de caja; con centavos hay que tocar ~45 conversiones `Number(...)` y todos los reportes.
2. **Integridad que hoy da Postgres gratis.** Con `relationMode = "prisma"` desaparecen las claves foráneas: un pedido puede quedar apuntando a una mesa o producto borrado.
3. **Lo que corregimos en WP-10 se vuelve más frágil.** El índice único `(pedido_id, referencia)` en Mongo trata los campos ausentes como un valor: un segundo pago en efectivo del mismo pedido (sin referencia) chocaría. Hay que crearlo como **índice parcial** (`partialFilterExpression: { referencia: { $type: "string" } }`) en un script aparte, porque Prisma no lo expresa — igual que hizo sportcenter con `scripts/mongo-indexes.ts`. Si ese script no corre, vuelve el pago duplicado sin que nada avise.
4. **Pagos parciales, stock y despacho** dependen de 8 transacciones con varias tablas; en Mongo se pueden mantener, pero hay que re-probarlas con carga real (hoy los tests usan una base falsa en memoria, no demuestran el comportamiento de Mongo).
5. **Migración de datos de producción.** `comida-app` tiene datos reales: ids `uuid` → `ObjectId` (o conservar el uuid como `String`), fechas, JSON. Requiere ensayo en una copia, plan de vuelta atrás y ventana de corte. Nada de eso se hizo ni se debe hacer sin tu OK.
6. **Esfuerzo y foco.** El tribunal pidió foco (Casa Nido → Orbe → Puerta). Esta migración consume tiempo sin cambiar lo que el comprador ve.

## A favor de migrar (lo que sí cuenta)
- Un solo motor (MongoDB/Atlas) para toda la cartera de productos: un solo despliegue repetible (V4), un solo backup y una sola plantilla de infraestructura.
- Atlas ofrece backups y monitoreo administrados (S10, V7).
- El dueño pidió «todo en MongoDB» (según `docs/MEJORAS-Y-ESTADO.md`).

## Qué cambiaría el voto a GO
Cualquiera de estos, **con un comprador real detrás** (no antes):
1. Un cliente exige Atlas/MongoDB por contrato o por infraestructura propia.
2. Se decide estandarizar toda la cartera y V4 (despliegue repetible) lo necesita.
3. Se completa una prueba de concepto en una copia (no en producción) que demuestre: `prisma generate` + cliente en Mongo, las 8 transacciones, el índice parcial de pagos y reportes de caja con montos exactos.

## Si algún día se hace: plan mínimo
1. Copia de `comida-app` (nunca la base viva) y rama aparte.
2. Schema: `provider = "mongodb"`, ids `@db.ObjectId`, montos en centavos enteros (no `Float`), `relationMode = "prisma"`.
3. Script de índices con el parcial de `pagos(pedidoId, referencia)`; tests que lo verifiquen contra un Mongo real en CI.
4. Reescribir `src/lib/prisma.ts` (sin `pg`), validadores `.uuid()` → ObjectId, seed, `docker-compose` con replica set, CI.
5. Ensayo de migración de datos con comparación de totales (suma de pagos, stock por producto) antes/después.
6. Corte con vuelta atrás: Postgres queda intacto hasta validar.

## Decisión pendiente del dueño (👤)
Confirmar **NO-GO** (recomendado) o pedir la prueba de concepto del punto 3. Mientras tanto: aplicar la migración `0002` a `comida-app` **cuando decidas** (`npx prisma migrate deploy`, previa consulta de duplicados que está en el propio SQL).
