# 2.12.4 — Detección de Patrones (no punitiva)

## Descripción
El sistema señala patrones de anulaciones/descuentos por empleado para que el dueño entienda qué pasa (bueno o malo), no para vigilar con látigo.

## Dependencias
- Logs de 2.12.1 y 2.12.2, `dashboard-bi.tsx`.

## Contenido
- Por empleado: tasa de anulaciones y descuentos vs promedio del equipo.
- Alerta si alguien se desvía mucho de la media.
- Contexto: turno, motivos frecuentes.
- El dueño decide si investigar, no hay sanción automática.

## Criterio de validación
- El dueño ve tasa de anulaciones/descuentos por empleado.
- Se alerta desviación sobre la media.
- El contexto acompaña la alerta (no solo el número).
