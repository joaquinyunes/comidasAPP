# 2.10.3 — Zonas de Reparto con Tiempo Estimado

## Descripción
Definición de zonas de reparto con tiempo estimado distinto según distancia, para que cocina sepa cuándo empezar a preparar (no cocinar muy temprano ni muy tarde).

## Dependencias
- `ZonaReparto` (modelo nuevo), `Pedido` dirección.
- Tiempos de cocción (2.6.2).

## Contenido
- El dueño define zonas y su tiempo de viaje estimado.
- Al tomar delivery, el sistema sugiere "preparar a las HH:MM" según zona.
- Cocina ve la hora de preparación sugerida por pedido.
- Ajuste fino por zona, no global.

## Criterio de validación
- El dueño define zonas con tiempos.
- Al tomar un delivery, se calcula hora de preparación sugerida.
- Cocina ve esa sugerencia por pedido.
