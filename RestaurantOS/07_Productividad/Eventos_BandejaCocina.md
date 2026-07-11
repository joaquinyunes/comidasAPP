# 2.14.3 — Bandeja de Tareas Programadas en Cocina

## Descripción
Vista en cocina solo de las tareas programadas (eventos), separada de las comandas del momento, para no mezclar prioridades.

## Dependencias
- `kds.tsx`, `Eventos_FlujoSeparado.md`.

## Contenido
- Pestaña "Programados" en el KDS con los eventos del día.
- Cada evento muestra progreso (lotes hechos / total).
- Al iniciar, los lotes pasan a la cola de horno normal.
- El mozo ve el estado del evento para avisar al cliente.

## Criterio de validación
- El KDS tiene pestaña de programados separada.
- Se ve progreso por evento.
- Los lotes entran a cola de horno al iniciar.
