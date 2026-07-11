# 2.14.1 — Flujo Separado de Pedidos Grandes

## Descripción
Un flujo aparte para pedidos de gran volumen con anticipación (20 pizzas para las 21hs) que no compite en tiempo real con el rush de mesas. Cocina los ve como "tarea programada".

## Dependencias
- `Pedido` con tipo EVENTO/GRAN_VOLUMEN y `horaProgramada`.
- `kds.tsx` (vista de programados).

## Contenido
- Alta de pedido grande con fecha/hora de entrega y cantidades.
- No entra a la cola del rush; va a una bandeja "programados".
- Cocina ve cuándo empezar según capacidad y tiempos (2.6.2).
- Un solo pedido agrupa todo el volumen para la cuenta.

## Criterio de validación
- Un pedido grande se crea aparte del rush.
- Aparece en bandeja de programados con hora de entrega.
- Cocina lo ve como tarea programada.
