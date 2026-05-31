# 2.14.6 — Resumen de Micro-fase 2.14: Modo Eventos / Pedidos Grandes

## Objetivo
Que los pedidos grandes (cumpleaños, catering, oficinas) se gestionen como tareas programadas, sin colapsar el rush ni quedarse cortos de stock.

## Archivos
1. `Eventos_FlujoSeparado.md` — alta aparte del rush.
2. `Eventos_Programacion.md` — cuándo preparar por capacidad.
3. `Eventos_BandejaCocina.md` — tareas programadas en KDS.
4. `Eventos_Confirmacion.md` — seña y aviso al cliente.
5. `Eventos_ImpactoStock.md` — reserva y compra.
6. Este resumen.

## Valor
Vender volumen grande sin romper el servicio del día a día.

## Implementación (estado: ✅)
- **API**: `GET /api/eventos` (pedidos `tipo="evento"` con cubiertos y pendientes de cocina), `POST /api/eventos/crear` (crea pedido de evento con `horaProgramada` y flujo separado).
- **UI**: `/dashboard/eventos` (`PanelEventos`).
- **Nota**: usa `Pedido.tipo` (valor `evento`) y `horaProgramada` ya existentes; sin schema nuevo.
