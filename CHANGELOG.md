# Changelog

## 2026-07-12 — Implementación de micro-fases 2.1, 2.2 y 2.3

Se pasan las primeras 3 micro-fases del Bloque 2 de "documentada" a "implementada" (API + UI + modelo de datos).

### Micro-fase 2.1 — Gestión de Personal y Turnos
- `Asistencia` extendido con `tipo`, `sucursalId`, `breakInicio`, `breakFin` (soporta ENTRADA/SALIDA/BREAK_IN/BREAK_OUT).
- API: `/api/personal/checklists` (CRUD de plantillas), `/api/personal/checklists/[id]/ejecutar`, `/api/personal/checklists/ejecuciones`, `/api/personal/fichaje`, `/api/personal/rendimiento`.
- UI: `/dashboard/personal` (`PanelPersonal`).

### Micro-fase 2.2 — Reducción de Fricción Física
- Anulación trazable: `POST /api/pedidos/[id]/items/[itemId]/anular` + `GET .../anulaciones`.
- Impresión de comanda: `GET /api/cocina/comandas`, `POST /api/cocina/comandas/[id]/imprimir`.
- Modo offline/LAN: `GET /api/friccion/estado`, `POST /api/friccion/sync` (cola diferida de anulaciones).
- UI: `/dashboard/friccion` (`PanelFriccion`).

### Micro-fase 2.3 — Multi-sucursal Consolidado
- API: `/api/multisucursal/dashboard`, `/api/multisucursal/recetas`, `/api/multisucursal/stock`, `/api/multisucursal/comparativas`, `/api/multisucursal/sucursales` (+ `PUT /[id]`).
- UI: `/dashboard/sucursales` → `ControlCentral` (dashboard, recetas, stock, comparativas, config).

### Infraestructura
- `prisma/schema.prisma`: modelos de Bloque 2 + relación `Sucursal.asistencias`.
- Migración inicial: `prisma/migrations/0001_init_bloque2/migration.sql` + `migration_lock.toml`.
- `src/lib/validation.ts`: schemas `ChecklistPlantillaSchema`, `ChecklistEjecucionSchema`, `FichajeSchema`, `AnulacionSchema`, `OfflineSyncSchema`, `RecetaCentralizadaSchema`, `SucursalConfigSchema`.
- Navegación del dashboard actualizada (Personal, Fricción, Sucursales).
