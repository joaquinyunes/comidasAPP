# 2.3.6 — Resumen de Micro-fase 2.3: Multi-sucursal Consolidado

## Objetivo
Que un dueño con varios locales tenga el control central (recetas, precios, visión) sin perder la autonomía operativa de stock de cada sucursal.

## Archivos
1. `MultiSucursal_Dashboard.md` — visión única comparativa.
2. `MultiSucursal_RecetasCentralizadas.md` — receta/precio único.
3. `MultiSucursal_StockIndependiente.md` — inventario por sucursal.
4. `MultiSucursal_Comparativas.md` — benchmarks entre locales.
5. `MultiSucursal_Configuracion.md` — permisos y config por sucursal.
6. Este resumen.

## Valor
Escalar a cadena sin perder control ni duplicar trabajo de catálogo.

## Implementación (estado: ✅)
- **API**: `GET /api/multisucursal/dashboard` (visión consolidada), `GET/POST /api/multisucursal/recetas` (catálogo centralizado), `GET /api/multisucursal/stock` (inventario por sucursal + bajo stock), `GET /api/multisucursal/comparativas` (benchmarks), `GET /api/multisucursal/sucursales` + `PUT /api/multisucursal/sucursales/[id]` (config por sucursal).
- **UI**: `src/app/dashboard/sucursales` (ya existente) usa `src/components/multi-sucursal/ControlCentral.tsx` con pestañas dashboard / recetas / stock / comparativas / config.
- **Validación**: `RecetaCentralizadaSchema`, `SucursalConfigSchema` en `src/lib/validation.ts`.
- **Nota**: respeta autonomía de stock por sucursal (`StockPorSucursal`) mientras comparte recetas/precios a nivel tenant.
