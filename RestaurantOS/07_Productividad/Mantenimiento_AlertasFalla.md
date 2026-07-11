# 2.13.4 — Alertas de Equipo Crítico Caído

## Descripción
Si un equipo crítico falla (horno, freezer), el sistema avisa al dueño/responsable de inmediato para minimizar el daño operativo.

## Dependencias
- `Equipo`, sensores o reporte manual de falla.

## Contenido
- Reporte de falla desde la terminal (o sensor).
- Alerta inmediata al dueño y responsable.
- Registro de incidente y tiempo de resolución.
- Cruza con impacto en pedidos pendientes.

## Criterio de validación
- Una falla dispara alerta inmediata al dueño.
- El incidente queda registrado con tiempo de resolución.
- Se ve el impacto en la operación.
