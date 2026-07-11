# 2.16.4 — Termómetro de Calidad en Tiempo Real

## Descripción
Vista del dueño con el pulso de satisfacción del turno (proporción de caritas), para ver si algo sale mal en la noche.

## Dependencias
- `dashboard-bi.tsx`, `Feedback_CaritaCierre.md`.

## Contenido
- Por turno: % feliz / neutral / triste.
- Alerta si el ratio de triste sube sobre la media.
- Cruza con mesas/pedidos para contexto.
- Visible solo para el dueño.

## Criterio de validación
- El dueño ve ratio de satisfacción por turno.
- Se alerta si el ratio de triste sube.
- El contexto acompaña la métrica.
