# 2.18.6 — Resumen de Micro-fase 2.18: Motivación Interna / Gamificación Operativa

## Objetivo
Que el mozo y el cocinero vean reflejado su buen trabajo en números concretos, como reconocimiento, no como presión.

## Archivos
1. `Gamificacion_RankingTiempos.md` — ranking de servicio.
2. `Gamificacion_CeroErrores.md` — distintivo de cero errores.
3. `Gamificacion_Tablero.md` — tablero del equipo.
4. `Gamificacion_Limites.md` — no presión, no sanción.
5. `Gamificacion_Metricas.md` — de dónde salen los números.
6. Este resumen.

## Valor
Equipo que se ve reconocido rinde mejor y se queda.

## Implementación (estado: ✅)
- **API**: `GET /api/gamificacion/tablero` agrega ranking de mozos por pedidos, anulaciones por usuario (cero errores) y tiempo promedio de cocción.
- **UI**: `/dashboard/gamificacion` (`PanelGamificacion`).
- **Nota**: usa datos existentes (Pedido, Anulacion, PedidoItem); sin schema nuevo.
