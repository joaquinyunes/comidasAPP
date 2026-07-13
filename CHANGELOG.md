# Changelog

## 2026-07-12 — Implementación de micro-fase 2.23

Se pasa la micro-fase 2.23 del Bloque 2 de "documentada" a "implementada" (API + UI). Bloque 2 completo (2.1–2.23).

### Micro-fase 2.23 — Crecimiento, Ventas y Licencias
- API: `/api/crecimiento/resumen` (planes de licencia, módulos activos, métricas de venta).
- UI: `/dashboard/crecimiento` (`PanelCrecimiento`).

## 2026-07-12 — Implementación de micro-fase 2.22

Se pasa la micro-fase 2.22 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.22 — Reportes, Demos y Onboarding
- API: `/api/reportes/resumen` (comparación por sucursal, totales 30d).
- UI: `/dashboard/reportes` (`PanelReportes`).

## 2026-07-12 — Implementación de micro-fase 2.21

Se pasa la micro-fase 2.21 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.21 — White-label & Multi-tenant
- API: `/api/whitelabel/resumen`, `POST /api/whitelabel/clonar-rubro`.
- UI: `/dashboard/whitelabel` (`PanelWhiteLabel`).
- Navegación del dashboard completa (todas las secciones del Bloque 2).

## 2026-07-12 — Implementación de micro-fase 2.20

Se pasa la micro-fase 2.20 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.20 — Configuración Self-service del Dueño
- API: `/api/selfservice/resumen` (categorías, productos, roles, promociones, módulos, listo-para-vender).
- UI: `/dashboard/selfservice` (`PanelSelfService`).
- Navegación del dashboard actualizada con Feedback, Resiliencia, Gamificación, Cliente Digital y Self-service.

## 2026-07-11 — Implementación de micro-fase 2.19

Se pasa la micro-fase 2.19 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.19 — Experiencia Cliente Digital
- API: `/api/cliente-digital/resumen` (alertas de feedback, combos, QR de mesas).
- UI: `/dashboard/cliente-digital` (`PanelClienteDigital`).

## 2026-07-10 — Implementación de micro-fase 2.18

Se pasa la micro-fase 2.18 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.18 — Gamificación Operativa
- API: `/api/gamificacion/tablero` (ranking de mozos, cero errores, tiempo promedio).
- UI: `/dashboard/gamificacion` (`PanelGamificacion`).

## 2026-07-09 — Implementación de micro-fase 2.17

Se pasa la micro-fase 2.17 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.17 — Resiliencia del Negocio
- API: `/api/resiliencia/estado` (pedidos 24h, anulaciones, mesas, integridad, modo solo-cobro).
- UI: `/dashboard/resiliencia` (`PanelResiliencia`).

## 2026-07-08 — Implementación de micro-fase 2.16

Se pasa la micro-fase 2.16 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.16 — Feedback de Calidad Post-consumo
- API: `/api/feedback/resumen` (total, % feliz, caritas tristes, alerta al dueño).
- UI: `/dashboard/feedback` (`PanelFeedback`).

## 2026-05-31 — Implementación de micro-fase 2.15

Se pasa la micro-fase 2.15 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.15 — Accesibilidad y Alcance del Cliente
- API: `/api/alcance/resumen` (monedas, menú multidioma, productos turísticos).
- UI: `/dashboard/alcance` (`PanelAlcance`).
- Navegación del dashboard actualizada con todas las secciones nuevas.

## 2026-05-31 — Implementación de micro-fase 2.14

Se pasa la micro-fase 2.14 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.14 — Modo Eventos / Pedidos Grandes
- API: `GET /api/eventos`, `POST /api/eventos/crear` (pedido `tipo="evento"`).
- UI: `/dashboard/eventos` (`PanelEventos`).

## 2026-05-30 — Implementación de micro-fase 2.13

Se pasa la micro-fase 2.13 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.13 — Mantenimiento de Equipos Críticos
- API: `/api/mantenimiento/equipos`, `POST /api/mantenimiento/equipos/[id]/intervencion`, `POST /api/mantenimiento/equipos/[id]/temperatura`.
- UI: `/dashboard/mantenimiento` (`PanelMantenimiento`).

## 2026-05-30 — Implementación de micro-fase 2.12

Se pasa la micro-fase 2.12 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.12 — Trazabilidad y Responsabilidad Interna
- API: `/api/trazabilidad/resumen` (anulaciones, eventos, quién hizo qué).
- UI: `/dashboard/trazabilidad` (`PanelTrazabilidad`).

## 2026-05-29 — Implementación de micro-fase 2.11

Se pasa la micro-fase 2.11 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.11 — Gestión de Compras y Proveedores
- API: `/api/compras/sugerencia-automatica` (quiebres de stock + cantidad sugerida).
- UI: `/dashboard/compras` (`PanelCompras`).

## 2026-05-29 — Implementación de micro-fase 2.10

Se pasa la micro-fase 2.10 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.10 — Logística de Delivery Propio
- API: `/api/delivery/seguimiento`, `POST /api/delivery/asignar`, `POST /api/delivery/[id]/estado`.
- UI: `/dashboard/delivery` (`PanelDelivery`).

## 2026-07-12 — Implementación de micro-fase 2.9

Se pasa la micro-fase 2.9 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.9 — Control Operativo del Dueño
- API: `/api/dueno/control-operativo` (platos devueltos, tiempos de servicio, mermas, mesas desatendidas, ranking de mozos).
- UI: `/dashboard/dueno` (`PanelControlDueno`).

## 2026-07-12 — Implementación de micro-fase 2.8

Se pasa la micro-fase 2.8 del Bloque 2 de "documentada" a "implementada" (API + UI pública).

### Micro-fase 2.8 — Autogestión del Cliente
- API pública: `/api/cliente/menu`, `/api/cliente/producto/[id]/opciones`, `POST /api/cliente/pedido`, `GET /api/cliente/pedido/[id]`, `GET /api/cliente/pedido/[id]/estado`.
- UI pública: `/cliente/[mesaId]` (`PanelAutoCliente`) — menú solo-disponible, carrito y seguimiento en vivo.
- Validación: `ClientePedidoSchema` en `src/lib/validation.ts`.
- Navegación del dashboard actualizada (Cocina, Mozo).

## 2026-07-12 — Implementación de micro-fase 2.7

Se pasa la micro-fase 2.7 del Bloque 2 de "documentada" a "implementada" (API + UI).

### Micro-fase 2.7 — El Trabajo del Mozo en el Salón
- API: `/api/mozo/mapa-semaforo`, `/api/mozo/alergias`, `/api/mozo/disponibilidad`, `/api/mozo/historial-mesa`, `/api/mozo/cuenta`.
- UI: `/dashboard/mozo` (`PanelMozo`) con mapa semáforo, alertas de alergia bloqueantes, disponibilidad en tiempo real y ayuda con la cuenta.

## 2026-07-12 — Implementación de micro-fase 2.6

Se pasa la micro-fase 2.6 del Bloque 2 de "documentada" a "implementada" (API + UI + datos).

### Micro-fase 2.6 — Eficiencia dentro de la Cocina
- Modelo `PedidoItem.urgente` (Boolean) para código de urgencia.
- API: `/api/cocina/estaciones` (agrupación por estación, urgentes primero), `/api/cocina/tiempos-coccion` (promedio por producto), `/api/cocina/items/[id]/urgente` (toggle), `/api/cocina/items/[id]/pausa` (golpe de campana / pausa).
- UI: `/dashboard/cocina` (`PanelCocinaEficiencia`).

### Infraestructura
- `prisma/schema.prisma`: campo `urgente` en `PedidoItem` + migración regenerada.

## 2026-07-12 — Implementación de micro-fases 2.4 y 2.5

Se pasan las micro-fases 2.4 y 2.5 del Bloque 2 de "documentada" a "implementada" (API + UI + datos).

### Micro-fase 2.4 — Fidelización Operativa
- Modelo `VisitaMesa` (historial por mesa/cliente) + back-relations en `Cliente`, `Mesa`, `Sucursal`.
- API: `/api/fidelizacion/clientes-recurrentes`, `/visitas` (registra visita y suma puntos/nivel), `/historial-mesa`, `/reconocimiento` (QR + sugerencias), `/sugerencias-mozo`, `/logistica`.
- UI: `/dashboard/fidelizacion` (`PanelFidelizacion`).
- Validación: `VisitaMesaSchema`, `ReconocimientoSchema`.

### Micro-fase 2.5 — Operativo: Comunicación Cocina-Mozos
- API: `/api/operativo/alertas` (semáforo de pase), `/pase` (mozo confirma entrega), `/comandas-estructuradas` (por estación), `/stock-tiempo-real` (quiebres), `/confirmacion-voz`.
- UI: `/dashboard/operativo` (`PanelOperativo`) con auto-refresh.
- Eventos `PedidoEvento`: `PASE_MOZO`, `CONFIRMACION_VOZ`.

### Infraestructura
- `prisma/schema.prisma`: modelo `VisitaMesa` + relaciones.
- Migración regenerada: `prisma/migrations/0001_init_bloque2/migration.sql`.
- Navegación del dashboard actualizada (Fidelización, Operativo).

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
