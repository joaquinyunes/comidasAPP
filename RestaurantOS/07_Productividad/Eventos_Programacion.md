# 2.14.2 — Programación de Preparación por Capacidad

## Descripción
El sistema calcula cuándo empezar a preparar el pedido grande según la capacidad del horno y los tiempos, para entregar justo a tiempo sin colapsar el rush.

## Dependencias
- `Eventos_FlujoSeparado.md`, tiempos de cocción (2.6.2).
- Capacidad de estación/horno.

## Contenido
- Por pedido grande: desglose de lotes y cuándo meter cada uno al horno.
- Sugiere ventana de preparación que no pisa el rush.
- El responsable ajusta la ventana si quiere.
- Alerta cuando arranca la ventana de preparación.

## Criterio de validación
- El sistema calcula ventana de preparación por capacidad.
- La ventana no pisa el rush normal.
- Se alerta al llegar la hora de empezar.
